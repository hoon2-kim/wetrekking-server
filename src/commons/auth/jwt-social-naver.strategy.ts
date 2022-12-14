import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }
  validate(accessToken, refreshToken, profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    return {
      // req.user ={값이 이안에 들어감} 리턴된 값 넣어주기
      email: profile.email,
      password: profile.id,
      name: profile.name,
      nickname: profile.nickname,
      phone: '',
      gender: '',
      birth: '',
    };
  }
}
