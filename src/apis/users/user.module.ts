import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAccessStrategy } from 'src/commons/auth/jwt-access.strategy';
import { EmailService } from '../email/email.service';
import { PhoneService } from '../phone/phone.service';
import { ReviewCount } from '../reviewCount/reviewCount.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      ReviewCount,
    ]),
  ],
  providers: [
    PhoneService,
    UserResolver, //
    UserService,
    EmailService,
    JwtAccessStrategy,
  ],
})
export class UserModule {}
