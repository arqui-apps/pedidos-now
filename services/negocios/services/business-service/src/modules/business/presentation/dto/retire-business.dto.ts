import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RetireBusinessDto {
  @ApiProperty({
    description: 'Operational reason for retiring the business.',
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  retirementReason!: string;
}
