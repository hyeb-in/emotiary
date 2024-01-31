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
import { jwtStrategy, localStrategy, googleStrategy } from './config/passport';
import { Logger } from './config/logger';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { sendAlarm } from './utils/alarm';
import http from 'http';
import { chat } from './utils/chat';
import { Server as SocketIoServer } from 'socket.io';
import { CronJob } from 'cron';
import { updateAudioUrlsPeriodically } from './utils/music';

const app: Express & { io?: any } = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(Logger);
sendAlarm();

app.use(passport.initialize());

const localStrategyInstance = localStrategy;
const jwtStrategyInstance = jwtStrategy;
const googleStrategyInstance = googleStrategy;

passport.use('local', localStrategyInstance);
passport.use('jwt', jwtStrategyInstance);
passport.use('google', googleStrategyInstance);

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

const io = new SocketIoServer(server, {
  path: '/chat',
  cors: {
    origin: 'https://kdt-ai-8-team02.elicecoding.com',
    methods: ['GET', 'POST', 'WEBSOCKET'],
    credentials: true,
  },
});
chat(io);
app.io = io;

export { app };
