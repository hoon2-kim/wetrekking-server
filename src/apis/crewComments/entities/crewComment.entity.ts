import { Field, ObjectType } from '@nestjs/graphql';
import { CrewBoard } from 'src/apis/crewBoards/entities/crewBoard.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class CrewComment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  comment: string;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  deletedAt: Date;

  @JoinTable()
  @ManyToOne(() => CrewBoard)
  @Field(() => CrewBoard)
  crewBoard: CrewBoard;

  @JoinTable()
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinTable()
  @ManyToOne(() => CrewComment)
  @Field(() => CrewComment)
  subCrewComment: CrewComment;
}
