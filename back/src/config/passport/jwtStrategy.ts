import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import jwtSecret from '../jwtSecret';
import { UserRow, getUserById } from '../../repositories/userRepository';
import passport from 'passport';

const jwtOptions = {
  // JWT를 추출하는 방법을 설정합니다. 여기서는 HTTP 요청 헤더의 Bearer 토큰을 추출합니다.
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // JWT의 시크릿 키를 설정합니다. 이 시크릿 키는 JWT를 생성할 때 사용된 키와 일치해야 합니다.
  secretOrKey: jwtSecret,
};

const jwtCallback = async (payload: Pick<UserRow, 'id'>, done: any) => {
  try {
    const { id } = payload;
    const user = await getUserById(id);

    if (!user) {
      return done(null, false, { message: '사용자가 존재하지 않습니다.' });
    }

    return done(null, user);
  } catch (error) {
    done(error);
  }
};

export const jwtStrategy = () =>
  passport.use('jwt', new JwtStrategy(jwtOptions, jwtCallback));
