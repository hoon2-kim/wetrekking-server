import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewBoard } from '../crewBoards/entities/crewBoard.entity';
import { User } from '../users/entities/user.entity';
import { Dib } from './entities/dib.entity';
import { DibResolver } from './dib.resolver';
import { DibService } from './dib.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dib, //
      User,
      CrewBoard,
    ]),
  ],
  providers: [
    DibResolver, //
    DibService,
  ],
})
export class DibModule {}