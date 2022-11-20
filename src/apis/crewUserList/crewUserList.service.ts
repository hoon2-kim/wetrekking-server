import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrewBoardAndList } from '../crewBoards/dto/crewUserList.output';
import { CrewBoard } from '../crewBoards/entities/crewBoard.entity';
import { CrewUserList } from './entities/crewUserList.entity';

@Injectable()
export class CrewUserListService {
  @InjectRepository(CrewUserList)
  private readonly crewUserListRepository: Repository<CrewUserList>;

  @InjectRepository(CrewBoard)
  private readonly crewBoardRepository: Repository<CrewBoard>; //

  async findAll({ userId }) {
    const result = [];
    const user = await this.crewUserListRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'crewBoard', 'crewBoard.user', 'crewBoard.mountain'],
    });
    user.map((el) => (el.user.id === userId ? result.push(el) : el));
    return result;
  }

  async findApplyList({ crewBoardId }) {
    return await this.crewUserListRepository.find({
      where: {
        crewBoard: {
          id: crewBoardId,
        },
        status: '대기',
      },
      relations: ['user', 'crewBoard', 'crewBoard.user', 'crewBoard.mountain'],
    });
  }

  async findAcceptedList({ crewBoardId }) {
    return await this.crewUserListRepository.find({
      where: {
        crewBoard: {
          id: crewBoardId,
        },
        status: '수락',
      },
      relations: ['user', 'crewBoard', 'crewBoard.user', 'crewBoard.mountain'],
    });
  }

  async findVisitToList({ userId }) {
    const crewUserList = await this.crewUserListRepository
      .createQueryBuilder('crewUserList')
      .leftJoinAndSelect('crewUserList.crewBoard', 'crewBoard')
      .leftJoinAndSelect('crewUserList.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('crewUserList.status = "완료"')
      .getMany();
    console.log(CrewUserList);

    const crewBoards = [];
    await Promise.all(
      crewUserList.map(async (crewBoard) => {
        crewBoards.push(
          await this.crewBoardRepository
            .createQueryBuilder('crewBoard')
            .leftJoinAndSelect('crewBoard.mountain', 'mountain')
            .leftJoinAndSelect('crewBoard.user', 'user')
            .where('crewBoard.id = :crewBoardId', {
              crewBoardId: crewBoard.crewBoard.id,
            })
            .getMany(),
        );
      }),
    );

    const data: CrewBoardAndList[] = await Promise.all(
      crewBoards.flat().map(async (crewBoard) => {
        const filteredList = await this.crewUserListRepository
          .createQueryBuilder('crewUserList')
          .leftJoinAndSelect('crewUserList.crewBoard', 'crewBoard')
          .leftJoinAndSelect('crewUserList.user', 'user')
          .where('crewBoard.id = :crewBoardId', {
            crewBoardId: crewBoard.id,
          })
          .andWhere('crewUserList.status = "완료"')
          .getMany();

        const assignedUsers = [];
        filteredList.map((el) => {
          assignedUsers.push(el.user);
        });

        return {
          ...crewBoard,
          assignedUsers,
        };
      }),
    );
    const result = [];
    crewUserList.map((crewUserList, idx) => {
      result.push({
        id: crewUserList.id,
        user: crewUserList.user,
        crewBoard: { ...data[idx] },
      });
    });
    console.log(result);
    return result;
  }

  async findHostList({ userId }) {
    return await this.crewBoardRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'mountain'],
    });
  }

  findOne(type) {
    return this.crewUserListRepository.findOne({
      where: type,
      relations: ['user', 'crewBoard'],
    });
  }

  async findCrewList({ userId, crewBoardId }) {
    return await this.crewUserListRepository.find({
      where: {
        crewBoard: { id: crewBoardId }, //
        user: { id: userId },
      },
      relations: ['user', 'crewBoard', 'crewBoard.user'],
    });
  }

  async create({ userId, crewBoardId }) {
    const userList = await this.crewUserListRepository.save({
      user: userId,
      crewBoard: crewBoardId,
    });
    return userList;
  }

  async update({ status, id }) {
    const crewUserList = await this.findOne({ id: id });
    const { ...crewUserListId } = crewUserList;

    return this.crewUserListRepository.save({
      ...crewUserListId,
      id: id,
      status: status,
    });
  }

  async delete({ crewBoardId }) {
    return await this.crewUserListRepository.delete({
      crewBoard: crewBoardId,
    });
  }
}
