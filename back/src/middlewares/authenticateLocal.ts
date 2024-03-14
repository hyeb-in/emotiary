import passport from 'passport';
import { Response, NextFunction } from 'express';
import { IUser } from '../types/user';

import { IRequest } from '../types/request';
import { generateError } from '../utils/errorGenerator';
import { publishToken } from '../services/authService';

export const localAuthentication = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    passport.authenticate(
      'local',
      { session: false },
      async (error: Error, user: IUser, info: any) => {
        if (error) {
          const err = generateError(500, error.message);
          next(err);
        }

        if (info) {
          const err = generateError(500, info.message);
          next(err);
        }

        const { accessToken, refreshToken } = await publishToken(user);

        req.user = user;
        req.accessToken = accessToken;
        req.refreshToken = refreshToken;

        next();
      },
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};
