import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  next_action?: string;
}
