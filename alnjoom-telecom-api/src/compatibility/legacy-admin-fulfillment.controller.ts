import { Controller } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminFulfillmentController } from '../shipping/shipping.controller';
import { ShippingService } from '../shipping/shipping.service';

/**
 * @deprecated Temporary deployed-client alias. The canonical endpoint is
 * /admin/fulfillment. TODO(ALNJOOM-2026-11-01): remove after one compatibility
 * window and route-usage verification.
 */
@ApiExcludeController()
@Controller('merchant/fulfillment')
export class LegacyAdminFulfillmentCompatibilityController extends AdminFulfillmentController {
  constructor(shippingService: ShippingService) {
    super(shippingService);
  }
}
