import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAccessStrategy } from 'src/commons/auth/jwt-access.strategy';
import { EmailService } from '../email/email.service';
import { PhoneService } from '../phone/phone.service';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
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
