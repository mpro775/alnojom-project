import { Controller } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminPaymentMethodsController } from '../payment-methods/payment-methods.controller';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';

/**
 * @deprecated Temporary deployed-client alias. The canonical endpoint is
 * /admin/payment-methods. TODO(ALNJOOM-2026-11-01): remove after one
 * compatibility window and route-usage verification.
 */
@ApiExcludeController()
@Controller('merchant/payment-methods')
export class LegacyAdminPaymentMethodsCompatibilityController extends AdminPaymentMethodsController {
  constructor(service: PaymentMethodsService) {
    super(service);
  }
}
