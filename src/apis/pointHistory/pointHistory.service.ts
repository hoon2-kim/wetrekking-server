import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointHistory } from './entities/pointHistory.entity';

@Injectable()
export class PointHistoryService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>, //
  ) {}

  async findAll({ userId, page }) {
    return await this.pointHistoryRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      take: 7,
      skip: page ? (page - 1) * 7 : 0,
      order: { createdAt: 'DESC' },
    });
  }
}
