import {
  login,
  logout,
  refreshToken,
  sendVerificationEmail,
  signup,
  verifyEmail,
} from '../controllers/authController';
import { Router } from 'express';
import { localAuthentication } from '../middlewares/authenticateLocal';
import { wrapAsyncController, wrapTryCatch } from '../utils/wrapper';

const authRouter = Router();

/**
 * 회원가입 플로우
 *
 * 1. 이메일 인증
 *  1-1. 메일 보내기 (redis에 인증번호 저장)
 *  1-2. 인증번호 체크 (temp user 테이블에 저장)
 * 2. 회원가입
 *  temp user에 존재하는지 확인!
 *
 */

//회원가입 시 인증메일 보내기
authRouter.post('/signup/email', wrapTryCatch(sendVerificationEmail));

//이메일 인증 확인
authRouter.post('/signup/email-verification', wrapTryCatch(verifyEmail));

//회원가입
authRouter.post('/signup', wrapAsyncController(signup));
//로그인
authRouter.post('/login', wrapAsyncController(localAuthentication), login);
authRouter.post('/logout', wrapAsyncController(logout));
authRouter.post('/refresh', wrapAsyncController(refreshToken));
export default authRouter;
