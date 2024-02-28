import { Response, NextFunction } from 'express';
import passport from 'passport';
import { IRequest } from '../types/request';
import { IUser } from '../types/user';

export const jwtAuthentication = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    passport.authenticate(
      'jwt',
      { session: false },
      (error: Error, user: IUser, info: any) => {
        if (error) {
          next(error);
        }
        if (info) {
          //TODO token 처리 경우의 수 추가
          if (info.name === 'TokenExpiredError') {
            return res.status(401).json({ expired: true });
          }
        }
        req.user = user;
        next();
      },
    )(req, res, next);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
