import { signup } from '../controllers/authController';
import { Router } from 'express';
import { localAuthentication } from '../middlewares/authenticateLocal';

const authRouter = Router();

authRouter.post('/signup', signup);

authRouter.post('/signin', localAuthentication);

export default authRouter;
