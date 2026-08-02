import { forwardRef, Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { StorefrontModule } from '../storefront/storefront.module';
import {
  AdminPaymentMethodsController,
  StorefrontPaymentMethodsController,
} from './payment-methods.controller';
import { LegacyAdminPaymentMethodsCompatibilityController } from '../compatibility/legacy-admin-payment-methods.controller';
import { PaymentMethodsRepository } from './payment-methods.repository';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  imports: [MediaModule, forwardRef(() => StorefrontModule)],
  controllers: [
    AdminPaymentMethodsController,
    LegacyAdminPaymentMethodsCompatibilityController,
    StorefrontPaymentMethodsController,
  ],
  providers: [PaymentMethodsService, PaymentMethodsRepository],
  exports: [PaymentMethodsService, PaymentMethodsRepository],
})
export class PaymentMethodsModule {}
