import jwt from 'jsonwebtoken';
import { deleteValue, getValue, setValue } from '../db/redisConnection';
import { generateError } from '../utils/errorGenerator';
import { IUser } from '../types/user';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from '../config/jwtSecret';
import { v4 as uuid } from 'uuid';
import { processInputData } from '../utils/processSql';
import {
  UserRow,
  createTempUser,
  createUser,
  getTempUser,
  getUserById,
  updateTempUser,
} from '../repositories/userRepository';
import { sendEmail } from '../utils/email';
import { generateRandomNumber } from '../utils/randomNum';
import bcrypt from 'bcrypt';

export const checkAndUpdateOrCreateTempUser = async (
  email: string,
): Promise<void> => {
  const existingUser = await getTempUser(email);

  if (existingUser) await updateTempUser(email);

  const id = uuid();
  if (!existingUser) await createTempUser(id, email);
};

export const createUserService = async (inputData: Partial<UserRow>) => {
  const { username, password, email } = inputData;

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuid();
  const userInputData = { id, username, password: hashedPassword, email };

  const { placeholders, processedQuery, values } =
    processInputData(userInputData);

  await createUser(placeholders, processedQuery, values);

  const user = getUserById(id);

  return user;
};

export const verifyEmailService = async (
  email: string,
  authText: string,
): Promise<boolean> => {
  const storedAuthText = await getValue(email);

  if (storedAuthText !== authText) return false;

  return true;
};

export const sendVerificationEmailService = async (
  email: string,
): Promise<void> => {
  const randomNum = generateRandomNumber();

  //TODO 인증 시간 정할 것
  await setValue(email, String(randomNum));

  sendEmail(email, `Emotiary 인증번호`, `인증번호: ${String(randomNum)}`, ``);
};

export const generateAccessToken = async (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET_KEY, {
    expiresIn: '30s',
  });
  console.log(accessToken);
  return accessToken;
};

export const publishToken = async (user: IUser) => {
  const { id } = user;
  const payload = { userId: id };
  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
    expiresIn: '30s',
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: '180s',
  });

  await setValue(id, refreshToken);

  return { accessToken, refreshToken };
};

export const getStoredToken = async (userId: string): Promise<string> => {
  const storedRefreshToken = await getValue(userId);

  if (!storedRefreshToken) throw generateError(401, '토큰 없음');

  return storedRefreshToken;
};

export const deleteToken = async (userId: string) => {
  const result = await deleteValue(userId);

  if (result === 0) throw generateError(500, '로그아웃 실패');
};

export const validateToken = (token: string) => {
  const result = jwt.verify(token, REFRESH_SECRET_KEY);

  return result;
};

export const decodeToken = (token: string) => {
  const payload = jwt.decode(token);
  if (payload === null || typeof payload === 'string') {
    throw generateError(400, 'Invalid token.');
  }

  return payload;
};
