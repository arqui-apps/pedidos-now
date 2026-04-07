import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SoftDeleteProductTypeDto {
  @ApiPropertyOptional({
    example: 'Se unificó con otra categoría',
    description: 'Motivo opcional del retiro lógico',
  })
  @IsOptional()
  @IsString()
  deletion_reason?: string;
}
