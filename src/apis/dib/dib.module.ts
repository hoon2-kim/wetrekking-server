import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewBoard } from '../crewBoards/entities/crewBoard.entity';
import { User } from '../users/entities/user.entity';
import { Dib } from './entities/dib.entity';
import { DibResolver } from './dib.resolver';
import { DibService } from './dib.service';
import { CrewBoardService } from '../crewBoards/crewBoard.service';
import { CrewBoardImage } from '../crewBoardImages/entities/crewBoardImage.entity';
import { CrewBoardImageService } from '../crewBoardImages/crewBoardImage.service';
import { CrewUserList } from '../crewUserList/entities/crewUserList.entity';
import { Mountain } from '../mountains/entities/mountain.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { PointHistory } from '../pointHistory/entities/pointHistory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dib, //
      User,
      CrewBoard,
      CrewBoardImage,
      CrewUserList,
      Mountain,
      PointHistory,
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],

  providers: [
    DibResolver, //
    DibService,
    CrewBoardService,
    CrewBoardImageService,
  ],
})
export class DibModule {}
