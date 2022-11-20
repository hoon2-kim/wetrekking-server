import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/type/context';
import { Repository } from 'typeorm';
import { CrewBoard } from '../crewBoards/entities/crewBoard.entity';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { CrewUserListService } from './crewUserList.service';
import { CrewUserList } from './entities/crewUserList.entity';

@Resolver()
export class CrewUserListResolver {
  constructor(
    private readonly crewUserListService: CrewUserListService, //
    private readonly emailService: EmailService, //

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CrewBoard)
    private readonly crewBoardRepository: Repository<CrewBoard>,
  ) {}

  // 크루 신청 리스트 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [[CrewUserList]])
  async fetchCrewUserList(
    @Context() context: IContext, //
  ) {
    const userId = context.req.user.id;
    const user = await this.crewUserListService.findAll({ userId });
    const userList = [];

    user.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    while (user.length > 0) {
      userList.push(user.splice(0, 10));
    }

    return userList;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [CrewUserList])
  async fetchApplyList(
    @Context() context: IContext, //
    @Args('crewBoardId') crewBoardId: string,
  ) {
    const result = await this.crewUserListService.findApplyList({
      crewBoardId,
    });

    if (result.length === 0) {
      throw new Error('신청자가 없습니다.');
    }

    return result;
  }

  @Query(() => [CrewUserList])
  async fetchAcceptedList(
    @Context() context: IContext, //
    @Args('crewBoardId') crewBoardId: string,
  ) {
    const result = await this.crewUserListService.findAcceptedList({
      crewBoardId,
    });

    return result;
  }

  // 방장인 올린 게시글 조회
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [[CrewBoard]])
  async fetchHostCrewList(
    @Context() context: IContext, //
  ) {
    const userId = context.req.user.id;
    const result = [];
    const list = await this.crewUserListService.findHostList({ userId });

    list.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    while (list.length > 0) {
      result.push(list.splice(0, 10));
    }
  }

  // 크루 리스트 추가
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async createCrewUserList(
    @Context() context: IContext,
    @Args('crewBoardId') crewBoardId: string, //
  ) {
    const userId = context.req.user.id;
    const find = await this.crewUserListService.findCrewList({
      crewBoardId,
      userId,
    });

    if (find.length !== 0) {
      throw new Error('이미 신청한 게시글입니다.');
    }

    const crewUserList = await this.crewUserListService.create({
      userId,
      crewBoardId,
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (user.point < 200) {
      throw new Error('포인트가 부족합니다! 포인트를 충전해주세요');
      // console.log('포인트가 부족하지만 개발 중이기에 넘어가준다.');
    }

    await this.userRepository.update(
      { id: userId },
      { point: user.point - 200 },
      // { point: user.point }, // 개발중으로 아직 포인트 안뻇어감
    );
    const crewBoard = await this.crewBoardRepository.findOne({
      where: { id: crewBoardId },
      relations: ['user'],
    });
    console.log(crewBoard);
    const nickname = user.nickname;
    const crewBoardTitle = crewBoard.title;
    const email = crewBoard.user.email;
    console.log(email);

    const result = await this.emailService.getApplyTemplate({
      nickname,
      crewBoardTitle,
    });
    const comment = '새로운 신청자가 있습니다!!';
    this.emailService.sendTemplateToEmail({ email, result, comment });

    return ' 크루 리스트에 추가 되었습니다.';
  }

  // 크루 리스트 신청 취소
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async deleteCrewUserList(
    @Context() context: IContext,
    @Args('crewBoardId') crewBoardId: string, //
  ) {
    const userId = context.req.user.id;
    await this.crewUserListService.delete({ crewBoardId });

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    await this.userRepository.update(
      { id: userId },
      { point: user.point + 200 },
      // { point: user.point }, // 개발중으로 아직 포인트 안뻇어감
    );
    return '크루 신청이 취소 되었습니다.';
  }

  // 크루 수락
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => CrewUserList)
  async acceptCrew(
    @Args('id') id: string, //
  ) {
    const crewUserList = await this.crewUserListService.update({
      id,
      status: '수락',
    });
    const crewUserId = await this.crewUserListService.findOne({ id });

    const email = crewUserId.user.email;
    const nickname = crewUserId.user.nickname;
    const crewBoardTitle = crewUserId.crewBoard.title;
    const result = await this.emailService.getApplyTemplate({
      nickname,
      crewBoardTitle,
    });
    const comment = '크루에 등록되었습니다.';
    this.emailService.sendTemplateToEmail({ email, result, comment });

    return crewUserList;
  }

  // 크루 거절
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => CrewUserList)
  async rejectCrew(
    @Args('id') id: string, //
  ) {
    const crewUserList = await this.crewUserListService.update({
      id,
      status: '거절',
    });
    const crewUserId = await this.crewUserListService.findOne({ id });
    const email = crewUserId.user.email;
    const nickname = crewUserId.user.nickname;
    const crewBoardTitle = crewUserId.crewBoard.title;

    const result = await this.emailService.getRejectTemplate({
      nickname,
      crewBoardTitle,
    });
    const comment = '크루에 거절되었습니다.';
    this.emailService.sendTemplateToEmail({ email, result, comment });
    return crewUserList;
  }

  // 반장이 출석체크 하면 status를 완료로 변경
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => CrewUserList)
  async finishCrew(
    @Args('id') id: string, //
  ) {
    return this.crewUserListService.update({
      id,
      status: '완료',
    });
  }

  // 갔던 산 리스트 조회 (status를 완료로 변경된 사항만 조회 가능)
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [CrewUserList])
  async fetchVisitList(
    @Context() context: IContext, //
  ) {
    const userId = context.req.user.id;

    const finishList = await this.crewUserListService.findVisitToList({
      userId,
    });

    return finishList;
  }
}
