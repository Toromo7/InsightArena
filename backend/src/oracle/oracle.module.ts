import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatorEventMatch } from '../creator-events/entities/creator-event-match.entity';
import { CreatorEvent } from '../creator-events/entities/creator-event.entity';
import { OracleService } from './oracle.service';
import { OracleController } from './oracle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CreatorEventMatch, CreatorEvent])],
  controllers: [OracleController],
  providers: [OracleService],
  exports: [OracleService],
})
export class OracleModule {}
