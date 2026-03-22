import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';

export class UpdateBusinessDto extends PartialType(
  OmitType(CreateBusinessDto, ['businessStatus'] as const),
) {}
