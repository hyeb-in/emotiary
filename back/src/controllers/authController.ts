import { plainToClass } from 'class-transformer';
import { userValidateDTO } from '../dtos/userDTO';
import { Request, Response } from 'express';
import { signupUser } from '../services/authService';

export const signup = async (req: Request, res: Response) => {
  //   plainToClass(userValidateDTO, req.body);
  // createUser 함수를 사용하여 새 사용자 생성
  const user = await signupUser(req.body);

  return res.status(200).json(user);
};
