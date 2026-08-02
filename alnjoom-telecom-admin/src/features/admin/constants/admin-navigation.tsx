import {
  AnalyticsIcon,
  BarChartIcon,
  CampaignIcon,
  DashboardIcon,
  DescriptionIcon,
  InventoryIcon,
  PeopleIcon,
  SettingsIcon,
  ShoppingCartIcon,
} from '../../../components/icons';
import { ADMIN_TOKENS } from '../../../theme/tokens';
import type { AdminNavItem, AdminTabKey } from '../admin-dashboard.types';

export const ADMIN_DRAWER_WIDTH = ADMIN_TOKENS.layout.sidebarWidth;

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: 'overview', label: 'الرئيسية', icon: <DashboardIcon /> },
  {
    key: 'group_products_inventory',
    label: 'المنتجات والمخزون',
    icon: <InventoryIcon />,
    children: [
      { key: 'products', label: 'المنتجات', icon: <InventoryIcon /> },
      { key: 'categories', label: 'الأقسام' },
      { key: 'brands', label: 'العلامات التجارية' },
      { key: 'attributes', label: 'المواصفات' },
      { key: 'filters', label: 'فلاتر المواصفات' },
      { key: 'inventory', label: 'المخزون' },
      { key: 'warehouses', label: 'المخازن' },
      { key: 'restockAlerts', label: 'تنبيهات التوفر' },
    ],
  },
  {
    key: 'group_sales_orders',
    label: 'المبيعات والطلبات',
    icon: <ShoppingCartIcon />,
    children: [
      { key: 'orders', label: 'الطلبات', icon: <ShoppingCartIcon /> },
      { key: 'abandonedCarts', label: 'السلات المتروكة' },
    ],
  },
  {
    key: 'group_customers_engagement',
    label: 'العملاء والتفاعل',
    icon: <PeopleIcon />,
    children: [
      { key: 'customers', label: 'العملاء' },
      { key: 'customerReviews', label: 'تقييمات العملاء' },
      { key: 'customerQuestions', label: 'أسئلة المنتجات' },
      { key: 'supportTickets', label: 'مركز الدعم الفني' },
      { key: 'notificationsCenter', label: 'مركز الإشعارات' },
    ],
  },
  {
    key: 'group_marketing',
    label: 'التسويق',
    icon: <CampaignIcon />,
    children: [
      { key: 'promotions', label: 'العروض التسويقية' },
      { key: 'advancedPromotions', label: 'العروض المتقدمة' },
      { key: 'coupons', label: 'الكوبونات' },
      { key: 'affiliates', label: 'التسويق بالعمولة' },
      { key: 'loyalty', label: 'برنامج الولاء' },
    ],
  },
  {
    key: 'group_analytics',
    label: 'التحليلات',
    icon: <AnalyticsIcon />,
    children: [
      { key: 'analyticsGeneral', label: 'نظرة عامة', icon: <AnalyticsIcon /> },
      { key: 'analyticsLive', label: 'مباشر', icon: <BarChartIcon /> },
      { key: 'analyticsProducts', label: 'تحليلات المنتجات' },
      { key: 'analyticsOperations', label: 'تحليلات العمليات' },
      { key: 'analyticsPayments', label: 'تحليلات المدفوعات' },
      { key: 'analyticsFinancial', label: 'التحليلات المالية' },
      { key: 'analyticsShipments', label: 'تحليلات التوصيل والاستلام' },
    ],
  },
  {
    key: 'group_reports',
    label: 'التقارير',
    icon: <DescriptionIcon />,
    children: [
      { key: 'reportsCustomers', label: 'تقارير العملاء' },
      { key: 'reportsSales', label: 'تقارير المبيعات' },
      { key: 'reportsInventory', label: 'تقارير المخزون' },
    ],
  },
  {
    key: 'group_settings',
    label: 'الإعدادات',
    icon: <SettingsIcon />,
    children: [
      { key: 'store', label: 'إعدادات نجوم تليكوم', icon: <SettingsIcon /> },
      { key: 'payments', label: 'المدفوعات وطرق الدفع' },
      { key: 'shipping', label: 'التوصيل والاستلام' },
      { key: 'staff', label: 'فريق العمل' },
      { key: 'webhooks', label: 'الربط المتقدم API' },
    ],
  },
];

export const ADMIN_PRIMARY_MOBILE_TABS: AdminTabKey[] = [
  'overview',
  'orders',
  'products',
];

const ADMIN_TAB_KEYS = new Set<AdminTabKey>(
  ADMIN_NAV_ITEMS.flatMap((group) => {
    if (group.children?.length) {
      return group.children.map((child) => child.key as AdminTabKey);
    }

    return typeof group.key === 'string' && group.key.startsWith('group_')
      ? []
      : [group.key as AdminTabKey];
  }),
);

export function isAdminTabKey(value: string): value is AdminTabKey {
  return ADMIN_TAB_KEYS.has(value as AdminTabKey);
}
