import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import type { RequestContextData } from '../common/utils/request-context.util';
import { MediaRepository } from '../media/media.repository';
import { OutboxService } from '../messaging/outbox.service';
import type { OrderStatus } from '../orders/constants/order-status.constants';
import { canTransitionPaymentStatus, type PaymentStatus } from './constants/payment.constants';
import type { ListPaymentsQueryDto } from './dto/list-payments-query.dto';
import type { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import type { UploadReceiptDto } from './dto/upload-receipt.dto';
import {
  PaymentsRepository,
  type PaymentRecord,
  type PaymentWithOrder,
} from './payments.repository';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { CHECKOUT_ERROR_CODES, CheckoutDomainException } from '../checkout/checkout.errors';
import { MetricsService } from '../observability/metrics.service';

export interface PaymentResponse {
  id: string;
  storeId: string;
  orderId: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  storePaymentMethodId: string | null;
  paymentMethodCatalogId: string | null;
  paymentMethodCode: string | null;
  paymentMethodName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  iban: string | null;
  instructionsAr: string | null;
  instructionsEn: string | null;
  payerReference: string | null;
  payerReceiptUrl: string | null;
  payerReceiptMediaAssetId: string | null;
  payerNote: string | null;
  customerSubmittedAt: Date | null;
  receiptUrl: string | null;
  receiptMediaAssetId: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  customerUploadedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithOrderResponse extends PaymentResponse {
  orderCode: string;
  orderStatus: string;
  orderTotal: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly auditService: AuditService,
    private readonly outboxService: OutboxService,
    private readonly affiliatesService: AffiliatesService,
    private readonly metricsService: MetricsService,
  ) {}

  async list(
    currentUser: AuthUser,
    query: ListPaymentsQueryDto,
  ): Promise<PaymentWithOrderResponse[]> {
    const filters: { orderId?: string; status?: PaymentStatus } = {};
    if (query.orderId) {
      filters.orderId = query.orderId;
    }
    if (query.status) {
      filters.status = query.status;
    }
    const payments = await this.paymentsRepository.listByStore(currentUser.storeId, filters);
    return payments.map((p) => this.toWithOrderResponse(p));
  }

  async listPendingReview(currentUser: AuthUser): Promise<PaymentWithOrderResponse[]> {
    const payments = await this.paymentsRepository.listPendingReview(currentUser.storeId);
    return payments.map((p) => this.toWithOrderResponse(p));
  }

  async getByOrderId(currentUser: AuthUser, orderId: string): Promise<PaymentResponse> {
    const payment = await this.paymentsRepository.findByOrderId(currentUser.storeId, orderId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toResponse(payment);
  }

  async getById(currentUser: AuthUser, paymentId: string): Promise<PaymentResponse> {
    const payment = await this.paymentsRepository.findById(currentUser.storeId, paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.toResponse(payment);
  }

  async uploadReceipt(
    currentUser: AuthUser,
    input: UploadReceiptDto,
    context: RequestContextData,
  ): Promise<PaymentResponse> {
    const mediaAsset = await this.mediaRepository.findById(currentUser.storeId, input.mediaAssetId);
    if (!mediaAsset) {
      throw new NotFoundException('Media asset not found');
    }

    const outcome = await this.paymentsRepository.withTransaction(async (db) => {
      const payment = await this.paymentsRepository.findByOrderIdInTransaction(
        db,
        currentUser.storeId,
        input.orderId,
      );
      if (!payment) throw new NotFoundException('Payment not found for this order');
      if ((payment.payment_method_code ?? payment.method) === 'cod') {
        throw new BadRequestException('Receipt can only be uploaded for manual transfer payments');
      }
      if (payment.status === 'under_review' && payment.receipt_media_asset_id === input.mediaAssetId) {
        return { payment, changed: false };
      }
      if (payment.status !== 'pending' && payment.status !== 'rejected') {
        throw new BadRequestException('Cannot upload receipt for this payment status');
      }
      const updated = await this.paymentsRepository.updateReceiptInTransaction(db, {
        paymentId: payment.id,
        storeId: currentUser.storeId,
        receiptMediaAssetId: input.mediaAssetId,
        receiptUrl: mediaAsset.public_url,
      });
      if (!updated) {
        throw new CheckoutDomainException(
          CHECKOUT_ERROR_CODES.PAYMENT_TRANSITION_CONFLICT,
          'Payment receipt was updated concurrently',
        );
      }
      await this.paymentsRepository.insertStatusHistory(db, {
        storeId: currentUser.storeId,
        paymentId: payment.id,
        orderId: payment.order_id,
        fromStatus: payment.status,
        toStatus: 'under_review',
        reviewedBy: null,
        reviewNote: 'Customer receipt uploaded',
      });
      await this.outboxService.enqueueInTransaction(db, {
        aggregateType: 'payment',
        aggregateId: payment.id,
        eventType: 'payment.receipt_uploaded',
        deduplicationKey: `payment.receipt_uploaded:${payment.id}:${input.mediaAssetId}`,
        payload: {
          paymentId: payment.id,
          orderId: input.orderId,
          storeId: currentUser.storeId,
          amount: Number(updated.amount),
          method: updated.payment_method_code ?? updated.method,
          receiptUrl: updated.receipt_url ?? updated.payer_receipt_url,
          uploadedAt: updated.customer_uploaded_at?.toISOString(),
          status: 'under_review',
          source: 'payment_receipt_upload',
        },
        headers: context.requestId ? { requestId: context.requestId } : {},
      });
      return { payment: updated, changed: true };
    });
    const updated = outcome.payment;

    if (outcome.changed) await this.auditService.log({
      action: 'payments.receipt_uploaded',
      storeId: currentUser.storeId,
      storeUserId: currentUser.id,
      targetType: 'payment',
      targetId: updated.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        orderId: input.orderId,
        mediaAssetId: input.mediaAssetId,
        requestId: context.requestId,
      },
    });

    return this.toResponse(updated);
  }

  async updateStatus(
    currentUser: AuthUser,
    paymentId: string,
    input: UpdatePaymentStatusDto,
    context: RequestContextData,
  ): Promise<PaymentResponse> {
    const outcome = await this.paymentsRepository.withTransaction(async (db) => {
      const payment = await this.paymentsRepository.findByIdInTransaction(
        db,
        currentUser.storeId,
        paymentId,
      );
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === input.status) return { payment, previousStatus: payment.status, changed: false };
      if (!canTransitionPaymentStatus(payment.status, input.status)) {
        this.metricsService.incrementCounter('payment_transition_conflict_total', {
          store_id: currentUser.storeId,
        });
        throw new CheckoutDomainException(
          CHECKOUT_ERROR_CODES.PAYMENT_TRANSITION_CONFLICT,
          `Cannot transition payment status from ${payment.status} to ${input.status}`,
        );
      }
      const updated = await this.paymentsRepository.updateStatusInTransaction(db, {
        paymentId: payment.id,
        storeId: currentUser.storeId,
        status: input.status,
        allowedPreviousStatuses: [payment.status],
        reviewedBy: currentUser.id,
        reviewNote: input.reviewNote ?? null,
      });
      if (!updated) {
        const current = await this.paymentsRepository.findByIdInTransaction(
          db,
          currentUser.storeId,
          paymentId,
        );
        if (current?.status === input.status) return { payment: current, previousStatus: payment.status, changed: false };
        throw new CheckoutDomainException(
          CHECKOUT_ERROR_CODES.PAYMENT_TRANSITION_CONFLICT,
          'Payment was reviewed concurrently',
        );
      }
      await this.paymentsRepository.insertStatusHistory(db, {
        storeId: currentUser.storeId,
        paymentId: payment.id,
        orderId: payment.order_id,
        fromStatus: payment.status,
        toStatus: input.status,
        reviewedBy: currentUser.id,
        reviewNote: input.reviewNote ?? null,
      });
      await this.outboxService.enqueueInTransaction(db, {
        aggregateType: 'payment',
        aggregateId: payment.id,
        eventType: 'payment.status_changed',
        deduplicationKey: `payment.status_changed:${payment.id}:${payment.status}:${input.status}`,
        payload: {
          paymentId: payment.id,
          orderId: payment.order_id,
          storeId: currentUser.storeId,
          amount: Number(updated.amount),
          method: updated.payment_method_code ?? updated.method,
          from: payment.status,
          to: input.status,
          source: 'payment_status_update',
        },
        headers: context.requestId ? { requestId: context.requestId } : {},
      });
      await this.affiliatesService.handlePaymentStatusChangedInTransaction(db, {
        storeId: currentUser.storeId,
        orderId: payment.order_id,
        nextStatus: input.status,
      });
      return { payment: updated, previousStatus: payment.status, changed: true };
    });

    if (outcome.changed) void this.auditService.log({
      action: 'payments.status_updated',
      storeId: currentUser.storeId,
      storeUserId: currentUser.id,
      targetType: 'payment',
      targetId: outcome.payment.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        from: outcome.previousStatus,
        to: input.status,
        reviewNote: input.reviewNote ?? null,
        requestId: context.requestId,
      },
    }).catch(() => undefined);

    return this.toResponse(outcome.payment);
  }

  async markCollected(
    currentUser: AuthUser,
    paymentId: string,
    context: RequestContextData,
  ): Promise<PaymentResponse> {
    const outcome = await this.paymentsRepository.withTransaction(async (db) => {
      const payment = await this.paymentsRepository.findByIdInTransaction(
        db,
        currentUser.storeId,
        paymentId,
      );
      if (!payment) throw new NotFoundException('Payment not found');
      if ((payment.payment_method_code ?? payment.method) !== 'cod') {
        throw new BadRequestException('Only COD payments can be marked as collected');
      }
      if (payment.status === 'approved') return { payment, previousStatus: payment.status, changed: false };
      if (payment.status !== 'pending') {
        throw new BadRequestException('Only pending COD payments can be marked as collected');
      }
      const updated = await this.paymentsRepository.markCollectedInTransaction(db, {
        paymentId,
        storeId: currentUser.storeId,
        reviewedBy: currentUser.id,
      });
      if (!updated) {
        throw new CheckoutDomainException(
          CHECKOUT_ERROR_CODES.PAYMENT_TRANSITION_CONFLICT,
          'COD payment was collected concurrently',
        );
      }
      await this.paymentsRepository.insertStatusHistory(db, {
        storeId: currentUser.storeId,
        paymentId,
        orderId: payment.order_id,
        fromStatus: payment.status,
        toStatus: 'approved',
        reviewedBy: currentUser.id,
        reviewNote: 'COD collected',
      });
      await this.outboxService.enqueueInTransaction(db, {
        aggregateType: 'payment',
        aggregateId: paymentId,
        eventType: 'payment.status_changed',
        deduplicationKey: `payment.status_changed:${paymentId}:pending:approved`,
        payload: {
          paymentId,
          orderId: payment.order_id,
          storeId: currentUser.storeId,
          amount: Number(updated.amount),
          method: updated.payment_method_code ?? updated.method,
          from: payment.status,
          to: 'approved',
          source: 'cod_collected',
        },
        headers: context.requestId ? { requestId: context.requestId } : {},
      });
      await this.affiliatesService.handlePaymentStatusChangedInTransaction(db, {
        storeId: currentUser.storeId,
        orderId: payment.order_id,
        nextStatus: 'approved',
      });
      return { payment: updated, previousStatus: payment.status, changed: true };
    });
    const updated = outcome.payment;
    if (outcome.changed) await this.auditService.log({
      action: 'payments.cod_collected',
      storeId: currentUser.storeId,
      storeUserId: currentUser.id,
      targetType: 'payment',
      targetId: paymentId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { orderId: updated.order_id, requestId: context.requestId },
    });
    return this.toResponse(updated);
  }

  private toResponse(payment: PaymentRecord): PaymentResponse {
    return {
      id: payment.id,
      storeId: payment.store_id,
      orderId: payment.order_id,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      storePaymentMethodId: payment.store_payment_method_id,
      paymentMethodCatalogId: payment.payment_method_catalog_id,
      paymentMethodCode: payment.payment_method_code,
      paymentMethodName: payment.payment_method_name,
      accountName: payment.account_name,
      accountNumber: payment.account_number,
      phoneNumber: payment.phone_number,
      iban: payment.iban,
      instructionsAr: payment.instructions_ar,
      instructionsEn: payment.instructions_en,
      payerReference: payment.payer_reference,
      payerReceiptUrl: payment.payer_receipt_url,
      payerReceiptMediaAssetId: payment.payer_receipt_media_asset_id,
      payerNote: payment.payer_note,
      customerSubmittedAt: payment.customer_submitted_at,
      receiptUrl: payment.receipt_url,
      receiptMediaAssetId: payment.receipt_media_asset_id,
      reviewedAt: payment.reviewed_at,
      reviewedBy: payment.reviewed_by,
      reviewNote: payment.review_note,
      customerUploadedAt: payment.customer_uploaded_at,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    };
  }

  private toWithOrderResponse(payment: PaymentWithOrder): PaymentWithOrderResponse {
    return {
      ...this.toResponse(payment),
      orderCode: payment.order_code,
      orderStatus: payment.order_status,
      orderTotal: Number(payment.order_total),
    };
  }
}
