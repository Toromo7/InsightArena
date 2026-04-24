import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  market_id: string;

  @IsString()
  @MaxLength(2000)
  reason: string;
}
