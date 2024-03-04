import { login, logout } from '../controllers/authController';
import { Router } from 'express';
import { localAuthentication } from '../middlewares/authenticateLocal';

const authRouter = Router();

//TODO try cath감싸주기
authRouter.post('/login', localAuthentication, login);
authRouter.post('/logout', logout);
authRouter.post('/refresh');
export default authRouter;
