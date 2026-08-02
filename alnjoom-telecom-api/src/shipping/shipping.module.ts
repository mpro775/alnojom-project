import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { LegacyAdminFulfillmentCompatibilityController } from '../compatibility/legacy-admin-fulfillment.controller';
import { ShippingCalculatorService } from './shipping-calculator.service';
import { AdminFulfillmentController, ShippingController } from './shipping.controller';
import { ShippingRepository } from './shipping.repository';
import { ShippingService } from './shipping.service';

@Module({
  imports: [SecurityModule],
  controllers: [
    ShippingController,
    AdminFulfillmentController,
    LegacyAdminFulfillmentCompatibilityController,
  ],
  providers: [ShippingService, ShippingRepository, ShippingCalculatorService],
  exports: [ShippingService, ShippingRepository, ShippingCalculatorService],
})
export class ShippingModule {}
