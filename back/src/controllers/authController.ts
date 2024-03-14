import { NextFunction, Request, Response } from 'express';
import { IRequest } from '../types/request';
import { generateError } from '../utils/errorGenerator';
import {
  checkAndUpdateOrCreateTempUser,
  decodeToken,
  deleteToken,
  generateAccessToken,
  getStoredToken,
  sendVerificationEmailService,
  validateToken,
  verifyEmailService,
} from '../services/authService';
import {
  getTempUserByEmailService,
  getUserByEmailService,
} from '../services/userService';

/**
 * @description 회원가입 시 이메일 보내기
 * @param req
 * @param res
 * @returns
 */
export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  //유저 존재하는지 확인
  const isExisted = await getUserByEmailService(email);
  if (isExisted) throw generateError(409, '해당 이메일은 이미 존재합니다');

  await sendVerificationEmailService(email);

  return res.status(200).json({ message: '메일 전송' });
};

/**
 * @description 인증번호 확인
 * @param req
 * @param res
 * @returns
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, authText } = req.body;

  const isChecked = await verifyEmailService(email, authText);

  console.log(isChecked);
  if (!isChecked) throw generateError(400, '인증번호 불일치');

  //TODO tempUser에 저장해야함
  await checkAndUpdateOrCreateTempUser(email);

  return res.status(200).json({ message: '인증 성공' });
};

/**
 * @description 인증 후 회원가입
 * @param req
 * @param res
 * @returns
 */
export const signup = async (req: Request, res: Response) => {
  //   plainToClass(userValidateDTO, req.body);
  // createUser 함수를 사용하여 새 사용자 생성
  // TODO response DTO 사용해야함

  const { email } = req.body;
  //이메일 존재하는지 체크
  const verifiedUser = await getTempUserByEmailService(email);

  if (!verifiedUser) throw generateError(401, '이메일 미인증');
  // const user = await createUserService(req.body);

  const user = await checkAndUpdateOrCreateTempUser(email);
  return res.status(201).json(user);
};

export const login = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken } = req;
    const user = { ...req.user, token: accessToken };

    return res
      .status(200)
      .cookie('refreshToken', refreshToken, { httpOnly: true })
      .json({ data: user, message: '성공' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw generateError(400, 'refresh token not found.');

    const { userId } = decodeToken(refreshToken);

    await deleteToken(userId);

    return res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
};

/**
 * @description accessToken 재발급
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const refreshToken = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw generateError(400, 'refresh token not found.');

    const isValid = validateToken(refreshToken);
    const { userId } = decodeToken(refreshToken);

    const storedRefreshToken = await getStoredToken(userId);

    if (!isValid || !storedRefreshToken || refreshToken !== storedRefreshToken)
      throw generateError(401, 'Unauthorized');

    const accessToken = await generateAccessToken(userId);

    return res
      .status(200)
      .json({ data: { token: accessToken }, message: '성공' });
  } catch (error) {
    next(error);
  }
};
