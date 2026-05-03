import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EvaluateCancellationPenaltyDto {
  @ApiProperty({ maxLength: 64, example: 'ORD-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalOrderCode!: string;
}
