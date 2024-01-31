import { Router } from 'express';
import { wrapAsyncController } from 'utils/wrapper';

const authRouter = Router();

// authRouter.post('/signup', wrapAsyncController());

authRouter.post('signin');

export default authRouter;
