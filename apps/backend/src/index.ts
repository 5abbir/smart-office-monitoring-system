import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { seedDevicesIfEmpty } from './seed';
import { initSimulator } from './simulator';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  await seedDevicesIfEmpty();
  
  initSimulator(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
