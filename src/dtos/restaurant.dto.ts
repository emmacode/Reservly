import 'reflect-metadata';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { TableStatus } from '../types';

export enum DaysOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export class OperatingHoursDto {
  @IsEnum(DaysOfWeek)
  day!: DaysOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Open time must be in HH:MM format (24-hour)',
  })
  openTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Close time must be in HH:MM format (24-hour)',
  })
  closeTime!: string;

  @IsBoolean()
  isOpen: boolean = true;
}

export class CreateRestaurantDto {
  @IsString()
  @Matches(/\S/, { message: 'Restaurant name cannot be empty' })
  name!: string;

  @IsString()
  @Matches(/\S/, { message: 'Restaurant address cannot be empty' })
  address!: string;

  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/\S/, { message: 'Restaurant email cannot be empty' })
  email!: string;

  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be greater than 0' })
  capacity!: number;

  @IsArray({ message: 'Please provide restaurant operating hours' })
  @ArrayNotEmpty({ message: 'Operating hours cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto)
  operatingHours!: OperatingHoursDto[];
}

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Restaurant name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Restaurant address cannot be empty' })
  address?: string;

  @IsOptional()
  @IsNumber()
  @Matches(/\S/, { message: 'Restaurant capacity cannot be empty' })
  capacity!: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Operating hours cannot be empty if provided' })
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto[];
}

export class AddTableDto {
  @IsString()
  tableNumber!: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  capacity!: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  adjacentTables?: string[];
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  capacity?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  adjacentTables?: string[];

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
