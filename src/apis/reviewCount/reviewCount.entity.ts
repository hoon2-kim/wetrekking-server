import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity()
@ObjectType()
export class ReviewCount {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ default: 1 })
  @Field(() => Int)
  reviewCount: number;

  @JoinColumn()
  @OneToOne(() => User)
  @Field(() => User)
  user: User;
}
