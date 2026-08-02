import { useEffect, useState } from 'react';
import type {
  AnalyticsAnomalyReport,
  AnalyticsAbandonedCartMetrics,
  AnalyticsCustomersRetention,
  AnalyticsDataQuality,
  AnalyticsFunnelConversion,
  AnalyticsFulfillmentSla,
  AnalyticsInventoryHealth,
  AnalyticsOverview,
  AnalyticsPaymentsPerformance,
  AnalyticsPromotionsEfficiency,
  AnalyticsSourceAttribution,
  AnalyticsStockoutRisk,
} from '../types';
import type { AdminRequester } from '../admin-dashboard.types';

interface AdminOverviewState {
  overview: AnalyticsOverview | null;
  fulfillmentSla: AnalyticsFulfillmentSla | null;
  paymentsPerformance: AnalyticsPaymentsPerformance | null;
  promotionsEfficiency: AnalyticsPromotionsEfficiency | null;
  inventoryHealth: AnalyticsInventoryHealth | null;
  stockoutRisk: AnalyticsStockoutRisk | null;
  customersRetention: AnalyticsCustomersRetention | null;
  funnelConversion: AnalyticsFunnelConversion | null;
  sourceAttribution: AnalyticsSourceAttribution | null;
  abandonedCartMetrics: AnalyticsAbandonedCartMetrics | null;
  dataQuality: AnalyticsDataQuality | null;
  anomalyReport: AnalyticsAnomalyReport | null;
}

interface AdminOverviewLoading {
  core: boolean;
  commerce: boolean;
  quality: boolean;
}

interface AdminOverviewErrors {
  core: string;
  commerce: string;
  quality: string;
}

const initialState: AdminOverviewState = {
  overview: null,
  fulfillmentSla: null,
  paymentsPerformance: null,
  promotionsEfficiency: null,
  inventoryHealth: null,
  stockoutRisk: null,
  customersRetention: null,
  funnelConversion: null,
  sourceAttribution: null,
  abandonedCartMetrics: null,
  dataQuality: null,
  anomalyReport: null,
};

const initialLoading: AdminOverviewLoading = {
  core: true,
  commerce: true,
  quality: true,
};

const initialErrors: AdminOverviewErrors = {
  core: '',
  commerce: '',
  quality: '',
};

export function useAdminOverviewData(request: AdminRequester) {
  const [state, setState] = useState<AdminOverviewState>(initialState);
  const [loading, setLoading] = useState<AdminOverviewLoading>(initialLoading);
  const [errors, setErrors] = useState<AdminOverviewErrors>(initialErrors);

  useEffect(() => {
    let isMounted = true;
    setLoading(initialLoading);
    setErrors(initialErrors);

    async function loadCoreGroup(): Promise<void> {
      try {
        const [overview, fulfillmentSla, paymentsPerformance, promotionsEfficiency] = await Promise.all([
          request<AnalyticsOverview>('/analytics/overview?window=30&limit=5', { method: 'GET' }),
          request<AnalyticsFulfillmentSla>('/analytics/operations/fulfillment-sla?window=30', { method: 'GET' }),
          request<AnalyticsPaymentsPerformance>('/analytics/payments/performance?window=30', { method: 'GET' }),
          request<AnalyticsPromotionsEfficiency>('/analytics/promotions/efficiency?window=30&limit=5', {
            method: 'GET',
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          overview,
          fulfillmentSla,
          paymentsPerformance,
          promotionsEfficiency,
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrors((prev) => ({
          ...prev,
          core: error instanceof Error ? error.message : 'تعذر تحميل مؤشرات الأداء الرئيسية.',
        }));
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, core: false }));
        }
      }
    }

    async function loadCommerceGroup(): Promise<void> {
      try {
        const [inventoryHealth, stockoutRisk, customersRetention, funnelConversion, sourceAttribution, abandonedCartMetrics] =
          await Promise.all([
            request<AnalyticsInventoryHealth>('/analytics/inventory/health?window=30&limit=5', {
              method: 'GET',
            }),
            request<AnalyticsStockoutRisk>('/analytics/inventory/stockout-risk?window=30&limit=5', {
              method: 'GET',
            }),
            request<AnalyticsCustomersRetention>('/analytics/customers/retention?window=30&limit=5', {
              method: 'GET',
            }),
            request<AnalyticsFunnelConversion>('/analytics/funnel/conversion?window=30', { method: 'GET' }),
            request<AnalyticsSourceAttribution>('/analytics/funnel/source-attribution?window=30&limit=5', {
              method: 'GET',
            }),
            request<AnalyticsAbandonedCartMetrics>('/analytics/funnel/abandoned-carts?window=30', {
              method: 'GET',
            }),
          ]);

        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          inventoryHealth,
          stockoutRisk,
          customersRetention,
          funnelConversion,
          sourceAttribution,
          abandonedCartMetrics,
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrors((prev) => ({
          ...prev,
          commerce: error instanceof Error ? error.message : 'تعذر تحميل بيانات التجارة والمخزون.',
        }));
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, commerce: false }));
        }
      }
    }

    async function loadQualityGroup(): Promise<void> {
      try {
        const [dataQuality, anomalyReport] = await Promise.all([
          request<AnalyticsDataQuality>('/analytics/quality/data-health?window=30', { method: 'GET' }),
          request<AnalyticsAnomalyReport>(
            '/analytics/quality/anomalies?window=30&anomalyThresholdPercent=25',
            { method: 'GET' },
          ),
        ]);

        if (!isMounted) {
          return;
        }

        setState((prev) => ({
          ...prev,
          dataQuality,
          anomalyReport,
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrors((prev) => ({
          ...prev,
          quality: error instanceof Error ? error.message : 'تعذر تحميل مؤشرات الجودة والتنبيهات.',
        }));
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, quality: false }));
        }
      }
    }

    loadCoreGroup().catch(() => undefined);
    loadCommerceGroup().catch(() => undefined);
    loadQualityGroup().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [request]);

  return {
    data: state,
    loading,
    errors,
  };
}
