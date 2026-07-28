import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  usuario?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
