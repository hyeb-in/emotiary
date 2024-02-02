import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByEmail } from '../../repositories/userRepository';
import passport from 'passport';

const localOptions = {
  usernameField: 'email',
  passwordField: 'password',
};

const localCallback = async (email: string, password: string, done: any) => {
  try {
    const user = await getUserByEmail(email);
    if (!user)
      return done(null, false, { message: '사용자가 존재하지 않습니다.' });

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched)
      return done(null, false, { message: '비밀전호가 일치하지 않습니다.' });

    return done(null, user);
  } catch (error) {
    done(error);
  }
};

export const localStrategy = () => {
  passport.use('local', new LocalStrategy(localOptions, localCallback));
};
