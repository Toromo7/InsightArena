import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CreatorEvent } from './entities/creator-event.entity';
import { CreatorEventMatch } from './entities/creator-event-match.entity';
import { CreatorEventPrediction } from './entities/creator-event-prediction.entity';
import { CreatorEventWinner } from './entities/creator-event-winner.entity';
import { CreatorEventsService } from './creator-events.service';
import { CreatorEventsController } from './creator-events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreatorEvent,
      CreatorEventMatch,
      CreatorEventPrediction,
      CreatorEventWinner,
    ]),
    CacheModule.register(),
  ],
  controllers: [CreatorEventsController],
  providers: [CreatorEventsService],
  exports: [CreatorEventsService],
})
export class CreatorEventsModule {}
