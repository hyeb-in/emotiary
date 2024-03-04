import { Response, NextFunction } from 'express';
import passport from 'passport';
import { IRequest } from '../types/request';
import { IUser } from '../types/user';
import { generateError } from '../utils/errorGenerator';

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
          if (info.message == 'No auth token')
            throw generateError(401, '토큰 없음');
          if (info.message == 'jwt expired')
            throw generateError(401, '토큰 만료');
          if (
            info.message == 'jwt malformed' ||
            info.message == 'invalid signature'
          )
            throw generateError(401, '유효하지 않은 토큰');

          throw generateError(401, info.message);
        }

        req.user = user;
        next();
      },
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};
