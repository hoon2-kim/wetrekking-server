import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { Cache } from 'cache-manager';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { PhoneService } from '../phone/phone.service';
import * as bcrypt from 'bcrypt';
import { IContext } from 'src/commons/type/context';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewCount } from '../reviewCount/reviewCount.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService, //
    private readonly phoneService: PhoneService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //
    @InjectRepository(ReviewCount)
    private readonly reviewCountRepository: Repository<ReviewCount>, //
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchUser(
    @Context() context: IContext, //
  ) {
    const id = context.req.user.id;
    return this.userService.findOne({ id });
  }

  // 아이디 찾기 (front 요청으로 query -> mutation 변경)
  @Mutation(() => String)
  async findUserEmail(
    @Args('name') name: string, //
    @Args('phone') phone: string,
    @Args('phoneToken') phoneToken: string,
  ) {
    // 이름과 핸드폰번호가 같은 user 정보 받아오기
    const userId = await this.userService.findOne({
      name,
      phone,
    });

    //  userRepository 에서 받아온 이름과 유저가 적은 이름이 같지 않으면 에러
    if (userId.name !== name) return '가입한 이름이 정확하지 않습니다.';

    // redis에서 phone.values 값과  유저가 적은 phoneToken이 일치 하지 않으면 에러
    const redisPhoneToken = await this.cacheManager.get(phone);
    if (redisPhoneToken !== phoneToken) {
      throw new Error('핸드폰 인증이 올바르지 않습니다.');
    }
    // userRepository 에서 해당 정보 객체로 받아오기
    const findEmail = await this.userService.findOne({ phone });

    // 이메일로 반환하기
    return findEmail.email;
  }

  // password 찾기(랜덤비밀번호 생성해서 반환하기)
  @Mutation(() => String) // (front 요청으로 query -> mutation 변경)
  async findUserPassword(
    @Args('name') name: string, //
    @Args('email') email: string,
    @Args('phone') phone: string,
    @Args('phoneToken') phoneToken: string,
  ) {
    const userPassword = await this.userService.findOne({
      name,
      email,
    });
    if (userPassword.email !== email)
      return '가입한 이메일이 정확하지 않습니다.';

    const redisPhoneToken = await this.cacheManager.get(phone);
    if (redisPhoneToken !== phoneToken) {
      throw new Error('휴대폰 인증이 올바르지 않습니다.');
    }
    // 랜덤 비밀번호 생성
    const randomPassword = Math.random()
      .toString(36)
      .substring(2, 10)
      .padStart(8, 'a1');
    await bcrypt.hash(randomPassword, 10);

    return randomPassword;
  }

  // 새비밀번호로 변경
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async updatePassword(
    @Context() context: IContext,
    @Args('password') password: string, //
  ) {
    // 로그인한 사람의 값을 찾아와서
    const hashedpassword = await bcrypt.hash(password, 10);
    const email = context.req.user.email;
    const changePassword = await this.userService.findOne({ email });

    await this.userRepository.save({
      ...changePassword,
      password: hashedpassword,
    });
    return '비밀번호가 정상적으로 변경되었습니다.';
  }

  // 이메일 중복 검증
  @Mutation(() => String)
  async checkEmail(
    @Args('email') email: string, //
  ) {
    const findEmail = await this.userService.findOne({ email });
    if (findEmail) {
      return false;
    }
    return true;
  }

  // 닉네임 중복 검증
  @Mutation(() => String)
  async checkNickName(
    @Args('nickname') nickname: string, //
  ) {
    const findNickName = await this.userService.findOne({ nickname });
    if (findNickName) {
      return false;
    }
    return true;
  }

  // 소셜로그인 추가정보 업데이트
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async socialUpdateUser(
    @Context() context: IContext,
    // @Args('nickname') nickname: string, //
    // @Args('phone') phone: string,
    // @Args('birth') birth: string,
    @Args('phoneToken') phoneToken: string,
    // @Args('gender') gender: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    // @Args('createSocialUserInput') createSocialUserInput: CreateSocialUserInput,
  ) {
    const email = context.req.user.email;
    console.log(email);

    // const user = await this.userService.findOne({ email });

    // redis에서 phone.values 값과  유저가 적은 phoneToken이 일치 하지 않으면 에러
    const redisPhoneToken = await this.cacheManager.get(updateUserInput.phone);
    if (redisPhoneToken !== phoneToken) {
      throw new Error('핸드폰 인증이 올바르지 않습니다.');
    }

    // userRepository 에서 해당 정보 객체로 받아오기
    // user null값부분 업데이트하기
    return this.userService.update({
      email,
      updateUserInput,
    });
  }

  @Query(() => ReviewCount)
  async fetchMountainKing() {
    const count = await this.reviewCountRepository.find({
      relations: ['user'],
    });
    count.sort((a, b) => b.reviewCount - a.reviewCount);
    return count.slice(0, 3);
  }

  // 회원가입
  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const checkTokenTrue = await this.cacheManager.get(createUserInput.phone);
    if (!checkTokenTrue) {
      throw new Error('휴대폰 인증이 올바르지 않습니다.');
    }

    return this.userService.create({
      createUserInput,
    });
  }
  // 유저 업데이트
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('email') email: string, //
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    if (updateUserInput.phone) {
      const checkTokenTrue = await this.cacheManager.get(updateUserInput.phone);
      if (!checkTokenTrue) {
        throw new Error('휴대폰 인증이 올바르지 않습니다.');
      }
    }

    return this.userService.update({ email, updateUserInput });
  }

  // 유저 삭제
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteUser(
    // email로 삭제 할지
    @Args('userId') userId: string, //
  ) {
    return this.userService.delete({ userId });
  }
}
