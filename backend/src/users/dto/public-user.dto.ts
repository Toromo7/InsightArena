import { Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  username: string;

  @Expose()
  stellar_address: string;

  @Expose()
  reputation_score: number;

  @Expose()
  total_predictions: number;

  @Expose()
  correct_predictions: number;

  @Expose()
  created_at: Date;
}
