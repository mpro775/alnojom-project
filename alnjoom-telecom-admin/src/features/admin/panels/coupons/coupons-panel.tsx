import { PromotionsPanel } from '../promotions';
import type { AdminRequester } from '../../admin-dashboard.types';

interface CouponsPanelProps {
  request: AdminRequester;
}

export function CouponsPanel({ request }: CouponsPanelProps) {
  return <PromotionsPanel request={request} mode="coupons" />;
}
