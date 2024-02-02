import passport from 'passport';
import { Response, NextFunction } from 'express';
import { IUser } from '../types/user';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshTokenInDatabase,
} from '../utils/tokenUtils';
import { IRequest } from '../types/request';
import { generateError } from '../utils/errorGenerator';

export const localAuthentication = (
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

        if (user) {
          //TODO 언제 소멸하는지 필요한가?
          //TODO refresh Token은 레디스
          const { token, expiresAt } = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

          req.token = token;
          req.user = user;
          req.refreshTokens = [refreshToken];
          req.expiresAt = expiresAt;
          const response = {
            accessToken: token,
            refreshToken,
            user,
          };
          res.status(200).json(response);
        }
      },
    )(req, res);
  } catch (error) {
    next(error);
  }
};
