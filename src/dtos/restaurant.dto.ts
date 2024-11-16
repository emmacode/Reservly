import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  @IsEmail()
  email!: string;
}

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;
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
