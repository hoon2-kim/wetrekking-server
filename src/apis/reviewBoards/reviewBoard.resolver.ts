import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/type/context';
import { ReviewBoardImageService } from '../reviewBoardImages/reviewBoardImage.service';
import { CreateReviewBoardInput } from './dto/createReviewBoard.input';
import { UpdateReviewBoardInput } from './dto/updateReviewBoard.input';
import { ReviewBoard } from './entities/reviewBoard.entity';
import { ReviewBoardService } from './reviewBoard.service';

@Resolver()
export class ReviewBoardResolver {
  constructor(
    private readonly reviewBoardService: ReviewBoardService,
    private readonly reviewBoardImageService: ReviewBoardImageService,
  ) {}

  @Query(() => ReviewBoard)
  fetchReviewBoard(@Args('reviewBoardId') reviewBoardId: string) {
    return this.reviewBoardService.findOneById({ reviewBoardId });
  }

  @Query(() => [[ReviewBoard]])
  async fetchReviewBoards() {
    const result = [];
    const reviewBoard = await this.reviewBoardService.findAll();
    reviewBoard.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

    while (reviewBoard.length > 0) {
      result.push(reviewBoard.splice(0, 10));
    }

    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ReviewBoard)
  async createReviewBoard(
    @Context() context: IContext,
    @Args('createReviewBoardInput')
    createReviewBoardInput: CreateReviewBoardInput,
    @Args('crewUserListId') crewUserListId: string,
    @Args({ name: 'imgURL', type: () => [String] }) imgUrl?: string[],
  ) {
    const userId = context.req.user.id;

    const result = await this.reviewBoardService.create({
      userId,
      crewUserListId,
      createReviewBoardInput,
    });

    if (imgUrl) {
      const reviewBoardId = result.id;
      await this.reviewBoardImageService.upload({ imgUrl, reviewBoardId });
    }

    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ReviewBoard)
  async updateReviewBoard(
    @Args('reviewBoardId') reviewBoardId: string,
    @Args('updateReviewBoardInput')
    updateReviewBoardInput: UpdateReviewBoardInput,
    @Args({ name: 'imgURL', type: () => [String] }) imgUrl?: string[],
  ) {
    const result = this.reviewBoardService.update({
      reviewBoardId,
      updateReviewBoardInput,
    });

    if (imgUrl) {
      await this.reviewBoardImageService.upload({ imgUrl, reviewBoardId });
    }
    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteReviewBoard(
    @Args('reviewBoardId') reviewBoardId: string, //
  ) {
    return this.reviewBoardService.delete({ reviewBoardId });
  }
}
