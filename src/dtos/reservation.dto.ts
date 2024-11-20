import { IsDate, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  restaurantName!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  persons!: number;
}
