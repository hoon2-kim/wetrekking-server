import { Field, ObjectType } from '@nestjs/graphql';
import { ReviewBoard } from 'src/apis/reviewBoards/entities/reviewBoard.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class ReviewBoardImage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  imgUrl: string;

  @Column()
  @Field(() => Boolean)
  isMain: boolean;

  @ManyToOne(() => ReviewBoard)
  @Field(() => ReviewBoard)
  reviewBoard: ReviewBoard;
}
