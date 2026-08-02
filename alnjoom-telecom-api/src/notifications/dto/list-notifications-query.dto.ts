import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  ADMIN_NOTIFICATION_CATEGORIES,
  ADMIN_NOTIFICATION_SEVERITIES,
  type AdminNotificationCategory,
  type AdminNotificationSeverity,
} from '../notification-events.registry';

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ enum: ADMIN_NOTIFICATION_CATEGORIES })
  @IsOptional()
  @IsIn(ADMIN_NOTIFICATION_CATEGORIES)
  category?: AdminNotificationCategory;

  @ApiPropertyOptional({ enum: ADMIN_NOTIFICATION_SEVERITIES })
  @IsOptional()
  @IsIn(ADMIN_NOTIFICATION_SEVERITIES)
  severity?: AdminNotificationSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
