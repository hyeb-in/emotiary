import { Prisma } from '@prisma/client';
import { generateRandomPassword } from '../utils/password';
import bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { userResponseDTO } from '../dtos/userDTO';
import { successApiResponseDTO } from '../utils/successResult';
import { emailToken, sendEmail } from '../utils/email';
import { emptyApiResponseDTO } from '../utils/emptyResult';
import { sql } from '../db/mysqlConnection';
import { v4 as uuid } from 'uuid';
import { prisma } from '../../prisma/prismaClient';
import { createUser, getUserById } from '../repositories/userRepository';

export const signupUser = async (inputData: any) => {
  const { username, password, email } = inputData;
  //TODO req.body대신 validator사용하기
  // 비밀번호를 해시하여 저장 (안전한 비밀번호 저장)
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuid();

  const userInputData = { id, username, hashedPassword, email };
  // 사용자 생성 및 저장
  await createUser(userInputData);

  // 사용자 가져오기
  const user = getUserById(id);

  return user;
  // const user = await prisma.user.create({
  //   data: { username, password: hashedPassword, email },
  // });

  // const UserResponseDTO = plainToClass(userResponseDTO, user, {
  //   excludeExtraneousValues: true,
  // });

  // const response = successApiResponseDTO(UserResponseDTO);
  // return response;
};

export const logout = async (userId: string) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId: userId,
    },
  });
};

export const forgotUserPassword = async (email: string) => {
  // 데이터베이스에서 사용자 이메일로 사용자 조회
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const response = emptyApiResponseDTO();
    return response;
  }

  // 임시 비밀번호 생성
  const tempPassword = generateRandomPassword();
  const saltRounds = 10;

  // 임시 비밀번호를 해시하여 저장
  const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

  // 사용자의 비밀번호를 업데이트하여 초기화
  await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword },
  });

  // 사용자에게 임시 비밀번호를 이메일로 전송
  await sendEmail(
    email,
    '비밀번호 재설정',
    `임시 비밀번호 : ${tempPassword}`,
    ``,
  );
};

export const resetUserPassword = async (email: string, password: string) => {
  // 데이터베이스에서 사용자 이메일로 사용자 조회
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const response = emptyApiResponseDTO();
    return response;
  }

  const saltRounds = 10;

  // 새로운 비밀번호를 해시하여 저장
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 사용자의 비밀번호를 업데이트하여 재설정
  await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword },
  });
};

export const emailLinked = async (email: string) => {
  const user = await prisma.user.create({
    data: {
      email,
      isVerified: false,
    },
  });

  const result = emailToken();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      verificationToken: result.token,
      verificationTokenExpires: result.expires,
    },
  });

  let baseUrl;
  if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://localhost:5001';
  } else {
    baseUrl = 'https://kdt-ai-8-team02.elicecoding.com';
  }
  const verifyUrl = `${baseUrl}/api/users/verifyEmail/${result.token}`;

  await sendEmail(
    email,
    '이메일 인증',
    '',
    `<p>눌러 주세요</p>
        <p><a href = "${verifyUrl}">Verify Email</a></p>
        <p>${result.expires}</p>`,
  );
};

export const verifyToken = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw { message: '토큰이 유효하지 않습니다.' };
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });
};

export const registerUser = async (
  email: string,
  username: string,
  password: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isVerified) {
    throw { message: '이메일 인증이 필요합니다.' };
  }

  // 비밀번호를 해시하여 저장 (안전한 비밀번호 저장)
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      password: hashedPassword,
    },
  });

  const UserResponseDTO = plainToClass(userResponseDTO, user, {
    excludeExtraneousValues: true,
  });

  const response = successApiResponseDTO(UserResponseDTO);
  return response;
};
