import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBusinessOrderStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observation?: string;
}
