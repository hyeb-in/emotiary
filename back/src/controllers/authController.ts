import { plainToClass } from 'class-transformer';
import { userValidateDTO } from '../dtos/userDTO';
import { NextFunction, Request, Response } from 'express';
import { IRequest } from '../types/request';

export const signin = async (
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
