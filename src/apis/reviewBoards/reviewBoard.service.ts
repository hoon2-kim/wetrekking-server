import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewCount } from '../reviewCount/reviewCount.entity';
import { User } from '../users/entities/user.entity';
import { ReviewBoard } from './entities/reviewBoard.entity';

@Injectable()
export class ReviewBoardService {
  constructor(
    @InjectRepository(ReviewBoard)
    private readonly reviewBoardRepository: Repository<ReviewBoard>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReviewCount)
    private readonly reviewCountRepository: Repository<ReviewCount>,
  ) {}

  findOneById({ reviewBoardId }) {
    return this.reviewBoardRepository.findOne({
      where: { id: reviewBoardId },
      relations: [
        'user',
        'crewUserList',
        'crewUserList.crewBoard',
        'crewUserList.crewBoard.mountain',
      ],
    });
  }

  findAll() {
    return this.reviewBoardRepository.find({
      relations: [
        'user',
        'crewUserList',
        'crewUserList.crewBoard',
        'crewUserList.crewBoard.mountain',
      ],
    });
  }

  async create({ userId, crewUserListId, createReviewBoardInput }) {
    const isReview = await this.reviewBoardRepository.find({
      where: {
        user: { id: userId },
        crewUserList: { id: crewUserListId },
      },
      relations: ['user', 'crewUserList'],
    });

    if (isReview.length !== 0) {
      throw new Error('이미 리뷰가 존재합니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const { ...reviewBoard } = createReviewBoardInput;
    const result = this.reviewBoardRepository.save({
      ...reviewBoard,
      user: { id: userId },
      crewUserList: { id: crewUserListId },
    });

    await this.userRepository.update(
      { id: userId },
      { point: user.point + 100 },
    );

    const count = await this.reviewCountRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!count) {
      this.reviewCountRepository.save({
        user: { id: userId },
      });
    } else {
      this.reviewCountRepository.update(
        { id: count.id },
        { reviewCount: count.reviewCount + 1 },
      );
    }

    return result;
  }

  async update({ reviewBoardId, updateReviewBoardInput }) {
    const reviewBoard = await this.reviewBoardRepository.findOne({
      where: { id: reviewBoardId },
    });
    return this.reviewBoardRepository.save({
      ...reviewBoard,
      id: reviewBoardId,
      ...updateReviewBoardInput,
    });
  }

  async delete({ reviewBoardId }) {
    const result = await this.reviewBoardRepository.softDelete({
      id: reviewBoardId,
    });
    return result.affected ? true : false;
  }
}
