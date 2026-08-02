import type { ConfigService } from '@nestjs/config';
import type { Channel } from 'amqplib';

export interface NotificationQueueNames {
  mainQueue: string;
  dlqQueue: string;
  retryCreatedQueue: string;
  retryStatusQueue: string;
  retryInventoryQueue: string;
  retryGenericQueue: string;
}

export const NOTIFICATION_ROUTING_PATTERNS = [
  'order.*',
  'payment.*',
  'inventory.*',
  'cart.*',
  'checkout.*',
  'support.*',
  'analytics.*',
  'customer.*',
];

export function resolveNotificationQueueNames(
  configService: ConfigService,
): NotificationQueueNames {
  return {
    mainQueue: configService.get<string>('NOTIFICATIONS_MAIN_QUEUE', 'alnjoom-telecom.notifications'),
    dlqQueue: configService.get<string>(
      'NOTIFICATIONS_DLQ_QUEUE',
      'alnjoom-telecom.notifications.dlq',
    ),
    retryCreatedQueue: configService.get<string>(
      'NOTIFICATIONS_RETRY_CREATED_QUEUE',
      'alnjoom-telecom.notifications.retry.created',
    ),
    retryStatusQueue: configService.get<string>(
      'NOTIFICATIONS_RETRY_STATUS_QUEUE',
      'alnjoom-telecom.notifications.retry.status',
    ),
    retryInventoryQueue: configService.get<string>(
      'NOTIFICATIONS_RETRY_INVENTORY_QUEUE',
      'alnjoom-telecom.notifications.retry.inventory',
    ),
    retryGenericQueue: configService.get<string>(
      'NOTIFICATIONS_RETRY_GENERIC_QUEUE',
      'alnjoom-telecom.notifications.retry.generic',
    ),
  };
}

export async function bindNotificationMainQueue(
  channel: Channel,
  exchange: string,
  queues: Pick<NotificationQueueNames, 'mainQueue'>,
): Promise<void> {
  await channel.assertQueue(queues.mainQueue, { durable: true });
  for (const pattern of NOTIFICATION_ROUTING_PATTERNS) {
    await channel.bindQueue(queues.mainQueue, exchange, pattern);
  }
}
