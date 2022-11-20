import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrewBoard } from '../crewBoards/entities/crewBoard.entity';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { CrewUserListResolver } from './crewUserList.resolver';
import { CrewUserListService } from './crewUserList.service';
import { CrewUserList } from './entities/crewUserList.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CrewBoard, CrewUserList])],
  providers: [
    CrewUserListResolver, //
    CrewUserListService,
    EmailService,
  ],
})
export class CrewUserListModule {}
