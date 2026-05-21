import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class DeleteProductDto {
  @ApiProperty({
    description: 'Operational reason for soft deleting the product.',
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  deletionReason!: string;
}
