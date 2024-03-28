import 'dotenv/config';
import { app } from './src/app';
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';
import { chat } from './src/utils/chat';

const PORT: number = parseInt(process.env.SERVER_PORT as string, 10) || 5001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ 정상적으로 서버를 시작하였습니다.  http://localhost:${PORT}`);
});

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
