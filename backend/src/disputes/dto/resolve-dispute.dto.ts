import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DisputeResolution } from '../entities/dispute.entity';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  admin_notes?: string;
}
