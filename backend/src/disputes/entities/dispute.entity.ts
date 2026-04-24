import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Market } from '../../markets/entities/market.entity';

export enum DisputeStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum DisputeResolution {
  UPHELD = 'upheld',
  OVERTURNED = 'overturned',
}

@Entity('disputes')
@Index(['market'])
@Index(['disputant'])
@Index(['status'])
@Index(['resolved_by'])
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @ManyToOne(() => Market, { onDelete: 'CASCADE' })
  market: Market;

  @Column({ type: 'uuid' })
  @IsUUID()
  market_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  disputant: User;

  @Column({ type: 'uuid' })
  @IsUUID()
  disputant_id: string;

  @Column('text')
  @IsString()
  reason: string;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.PENDING,
  })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @Column({
    type: 'enum',
    enum: DisputeResolution,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  admin_notes: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @IsOptional()
  resolved_by: User | null;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  resolved_by_id: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  @IsOptional()
  resolved_at: Date | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  on_chain_dispute_id: string | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  on_chain_resolution_tx: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
