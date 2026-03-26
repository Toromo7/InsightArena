import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Competition,
  CompetitionVisibility,
} from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitionsRepository: Repository<Competition>,
  ) {}

  async create(dto: CreateCompetitionDto, user: User): Promise<Competition> {
    const inviteCode =
      dto.visibility === CompetitionVisibility.Private
        ? Math.random().toString(36).slice(2, 8).toUpperCase()
        : null;

    const competition = this.competitionsRepository.create({
      title: dto.title,
      description: dto.description,
      start_time: new Date(dto.start_time),
      end_time: new Date(dto.end_time),
      prize_pool_stroops: dto.prize_pool_stroops,
      max_participants: dto.max_participants ?? undefined,
      visibility: dto.visibility,
      invite_code: inviteCode ?? undefined,
      creator: user,
    });

    return this.competitionsRepository.save(competition);
  }

  async findAll(): Promise<Competition[]> {
    return this.competitionsRepository.find({
      where: { visibility: CompetitionVisibility.Public },
      order: { created_at: 'DESC' },
      relations: ['creator'],
    });
  }

  async findById(id: string): Promise<Competition | null> {
    return this.competitionsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }
}
