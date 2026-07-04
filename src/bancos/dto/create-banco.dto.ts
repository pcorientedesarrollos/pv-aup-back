import { IsString } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  banco: string;

  @IsString()
  logotipo: string;
}
