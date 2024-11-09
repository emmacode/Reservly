import { IsEmail, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsString()
  @IsEmail()
  email!: string;
}
