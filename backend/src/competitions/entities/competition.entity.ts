import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CompetitionVisibility {
  Public = 'public',
  Private = 'private',
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz' })
  end_time: Date;

  @Column({ type: 'bigint', default: 0 })
  prize_pool_stroops: string;

  @Column({ nullable: true })
  max_participants: number;

  @Index()
  @Column({
    type: 'enum',
    enum: CompetitionVisibility,
    default: CompetitionVisibility.Public,
  })
  visibility: CompetitionVisibility;

  @Column({ nullable: true, unique: true })
  invite_code: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ nullable: true })
  creator_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
