import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ReservationDateDto {
  @IsDateString()
  date!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format',
  })
  time!: string;
}

export class ValidateReservationDto {
  @ValidateNested()
  @Type(() => ReservationDateDto)
  reserveDate!: ReservationDateDto;
}

export class CheckAvailabilityDto {
  @IsString()
  restaurantName!: string;

  @ValidateNested()
  @Type(() => ReservationDateDto)
  reserveDate!: ReservationDateDto;

  @IsNumber()
  @Min(1)
  @Max(10)
  persons!: number;
}

export class CreateReservationDto {
  @ValidateNested()
  @Type(() => ReservationDateDto)
  reserveDate!: ReservationDateDto;

  @IsNumber()
  @Min(1, { message: 'Minimum of 1 person' })
  persons!: number;

  @IsString()
  @Matches(/\S/, { message: 'First Name cannot be empty' })
  first_name!: string;

  @IsString()
  @Matches(/\S/, { message: 'Last Name cannot be empty' })
  last_name!: string;

  @IsPhoneNumber('NG', {
    message: 'Phone number must be a valid Nigerian number',
  })
  phone!: number;

  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @Matches(/\S/, { message: 'Restaurant email cannot be empty' })
  email!: string;

  @IsString()
  @IsOptional()
  additional_notes!: string;
}

export class UpdateReservationDto {
  @ValidateNested()
  @Type(() => ReservationDateDto)
  reserveDate!: ReservationDateDto;

  @IsNumber()
  @Min(1, { message: 'Minimum of 1 person' })
  persons!: number;

  @IsPhoneNumber('NG', {
    message: 'Phone number must be a valid Nigerian number',
  })
  phone!: number;
}
