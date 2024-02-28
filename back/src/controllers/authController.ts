import { plainToClass } from 'class-transformer';
import { userValidateDTO } from '../dtos/userDTO';
import { NextFunction, Request, Response } from 'express';
import { signupUser } from '../services/authService';
import { IRequest } from '../types/request';

export const signup = async (req: Request, res: Response) => {
  //   plainToClass(userValidateDTO, req.body);
  // createUser 함수를 사용하여 새 사용자 생성
  const user = await signupUser(req.body);

  return res.status(200).json(user);
};

export const signin = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const { accessToken, refreshToken } = req;
  const user = { ...req.user, token: accessToken };

  return res
    .status(200)
    .json({ data: user, message: '성공' })
    .cookie('refreshToken', refreshToken, { httpOnly: true });
};
