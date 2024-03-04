import { NextFunction, Request, Response } from 'express';
import { IRequest } from '../types/request';
import { generateError } from '../utils/errorGenerator';
import { deleteToken, verifyToken } from '../services/authService';

export const login = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken, refreshToken } = req;
  const user = { ...req.user, token: accessToken };

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, { httpOnly: true })
    .json({ data: user, message: '성공' });
};

export const logout = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw generateError(400, 'refresh token not found.');

  const userId = await verifyToken(
    refreshToken,
    process.env.REFRESH_SECRET_KEY,
  );

  await deleteToken(userId);

  //TODO response form 수정
  return res.status(200).json('로그아웃 성공');
};
