import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNumber,
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

export class CreateReservationDto {
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
