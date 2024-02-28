import passport from 'passport';
import { Response, NextFunction } from 'express';
import { IUser } from '../types/user';
import {
  generateAccessToken,
  generateRefreshToken,
  publishToken,
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
          const { accessToken, refreshToken } = await publishToken(user);
          req.accessToken = accessToken;
          req.user = user;
          req.refreshToken = refreshToken;

          //   const { token, expiresAt } = generateAccessToken(user);
          //   const reh freshToken = generateRefreshToken(user);
          //   await storeRefreshTokenInDatabase(user.id, refreshToken);

          //   req.token = token;
          //   req.user = user;
          //   req.refreshTokens = [refreshToken];
          //   req.expiresAt = expiresAt;
          //   const response = {
          //     accessToken: token,
          //     refreshToken,
          //     user,
          //   };
          //   res.status(200).json(response);
          // }
        }
        next();
      },
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};
