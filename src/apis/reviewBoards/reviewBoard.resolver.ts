import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateReviewBoardInput } from './dto/createReviewBoard.input';
import { UpdateReviewBoardInput } from './dto/updateReviewBoard.input';
import { ReviewBoard } from './entities/reviewBoard.entity';
import { ReviewBoardService } from './reviewBoard.service';

@Resolver()
export class ReviewBoardResolver {
  constructor(private readonly reviewBoardService: ReviewBoardService) {}

  @Query(() => ReviewBoard)
  fetchReviewBoard(@Args('reviewBoardId') reviewBoardId: string) {
    return this.reviewBoardService.findOneById({ reviewBoardId });
  }

  @Query(() => [ReviewBoard])
  fetchReviewBoards() {
    return this.reviewBoardService.findAll();
  }

  @Mutation(() => ReviewBoard)
  createReviewBoard(
    @Args('createReviewBoardInput')
    createReviewBoardInput: CreateReviewBoardInput,
    @Args({ name: 'imgURL', type: () => [String] }) imgUrl: string[],
  ) {
    return this.reviewBoardService.create({ createReviewBoardInput });
  }

  @Mutation(() => ReviewBoard)
  updateReviewBoard(
    @Args('reviewBoardId') reviewBoardId: string,
    @Args('updateReviewBoardInput')
    updateReviewBoardInput: UpdateReviewBoardInput,
  ) {
    return this.reviewBoardService.update({
      reviewBoardId,
      updateReviewBoardInput,
    });
  }
}