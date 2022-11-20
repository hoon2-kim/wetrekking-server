import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewBoardImageService } from '../crewBoardImages/crewBoardImage.service';
import { CrewBoardImage } from '../crewBoardImages/entities/crewBoardImage.entity';
import { CrewUserList } from '../crewUserList/entities/crewUserList.entity';
import { DibService } from '../dib/dib.service';
import { Dib } from '../dib/entities/dib.entity';
import { Mountain } from '../mountains/entities/mountain.entity';
import { PointHistory } from '../pointHistory/entities/pointHistory.entity';
import { User } from '../users/entities/user.entity';
import { CrewBoardResolver } from './crewBoard.resolver';
import { CrewBoardService } from './crewBoard.service';
import { CrewBoard } from './entities/crewBoard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CrewBoard, //
      CrewBoardImage,
      User,
      CrewUserList,
      Mountain,
      Dib,
      CrewUserList,
      PointHistory,
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],
  providers: [
    CrewBoardResolver,
    CrewBoardService, //
    CrewBoardImageService,
    DibService,
  ],
})
export class CrewBoardModule {}
