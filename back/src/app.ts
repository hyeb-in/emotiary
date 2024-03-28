import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger/swagger-output.json';
import bodyParser from 'body-parser';
import userRouter from './routes/userRouter';
import passport from 'passport';
import diaryRouter from './routes/diaryRouter';
import favoriteRouter from './routes/favoriteRouter';
import friendRouter from './routes/friendRouter';
import commentRouter from './routes/commentRouter';
import roomRouter from './routes/roomRouter';
import authRouter from './routes/authRouter';
import { googleStrategy } from './config/passport';
import { Logger } from './config/logger';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { sendAlarm } from './utils/alarm';
import http from 'http';
import { CronJob } from 'cron';
import { updateAudioUrlsPeriodically } from './utils/music';
import { localStrategy } from './config/passport/localStrategy';
import { jwtStrategy } from './config/passport/jwtStrategy';
import cookieParser = require('cookie-parser');

const app: Express & { io?: any } = express();
const server = http.createServer(app);
app.use(
  cors({
    //TODO 나중에 변경
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(Logger);
sendAlarm();

app.use(passport.initialize());

const googleStrategyInstance = googleStrategy;

//passport 전략들
localStrategy();
jwtStrategy();
// passport.use('google', googleStrategyInstance);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const job = new CronJob('0 */6 * * *', () => {
  updateAudioUrlsPeriodically();
});

// CronJob 시작
job.start();

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, { explorer: true }),
);

app.get('/', (req: Request, res: Response) => {
  res.send('기본 페이지');
});

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/friend', friendRouter);
apiRouter.use('/diary', diaryRouter);
apiRouter.use('/favorites', favoriteRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/room', roomRouter);

app.use('/api', apiRouter);

app.use('/api/fileUpload', express.static('fileUpload'));
app.use(errorMiddleware);

export { app };
