import { inputAI } from './comment';
import { IUser } from './user';
import { Request } from 'express';

export interface IRequest extends Request {
  user: IUser | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  inputAI: inputAI;
}
