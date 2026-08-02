import { PromotionsPanel } from '../promotions';
import type { AdminRequester } from '../../admin-dashboard.types';

interface AdvancedPromotionsPanelProps {
  request: AdminRequester;
}

export function AdvancedPromotionsPanel({ request }: AdvancedPromotionsPanelProps) {
  return <PromotionsPanel request={request} mode="advanced" />;
}
