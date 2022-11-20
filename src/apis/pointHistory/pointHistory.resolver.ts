import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/type/context';
import { PointHistory } from './entities/pointHistory.entity';
import { PointHistoryService } from './pointHistory.service';

@Resolver()
export class PointHistoryResolver {
  constructor(
    private readonly pointHistoryService: PointHistoryService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [PointHistory], {
    description: '로그인한 유저의 이용내역 전체 조회',
  })
  async fetchPointHistory(
    @Context() context: IContext, //
    @Args('page', { nullable: true, type: () => Int }) page: number,
  ) {
    const userId = context.req.user.id;

    return this.pointHistoryService.findAll({ userId, page });
  }
}
