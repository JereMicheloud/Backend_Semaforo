import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { createServer } from 'http';

// Imports usando require para evitar problemas de tipos
const morgan = require('morgan');
const { Server } = require('socket.io');

// Tipos para Socket.IO
interface SocketIOServer {
  on(event: string, callback: (socket: any) => void): void;
  to(room: string): {
    emit(event: string, data: any): void;
  };
}

interface SocketInstance {
  id: string;
  on(event: string, callback: () => void): void;
  join(room: string): void;
}

// Importar configuración y rutas
import { initializeDatabase } from './config/database';
import sensorRoutes from './routes/sensors';

// Cargar variables de entorno
dotenv.config();

class App {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    }) as SocketIOServer;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private initializeMiddlewares(): void {
    // Middleware de seguridad con CSP personalizada para permitir CDNs
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://cdn.jsdelivr.net",
            "https://cdn.socket.io"
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));
    
    // Compresión
    this.app.use(compression());
    
    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // máximo 1000 requests por ventana de 15 min
      message: 'Demasiadas requests, intenta más tarde'
    });
    this.app.use('/api', limiter);

    // Parsear JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware para logging de requests
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Ruta de salud
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    // Ruta principal
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Backend Sistema de Semáforos - API v1.0',
        documentation: '/api-docs',
        health: '/health',
        endpoints: {
          sensors: '/api/sensors',
          latest: '/api/sensors/latest',
          analytics: '/api/sensors/analytics',
          chartData: '/api/sensors/chart-data'
        }
      });
    });

    // Rutas de sensores
    this.app.use('/api/sensors', sensorRoutes);

    // Servir archivos estáticos para el dashboard (si existe)
    this.app.use('/dashboard', express.static('public'));
  }

  private initializeErrorHandling(): void {
    // Manejo de rutas no encontradas
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Manejo global de errores
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('❌ Error no manejado:', err);
      
      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    });
  }

  private initializeWebSocket(): void {
    this.io.on('connection', (socket: SocketInstance) => {
      console.log('🔌 Cliente conectado via WebSocket:', socket.id);

      socket.on('subscribe-sensors', () => {
        socket.join('sensor-updates');
        console.log('📡 Cliente suscrito a actualizaciones de sensores');
      });

      socket.on('disconnect', () => {
        console.log('🔌 Cliente desconectado:', socket.id);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Inicializar base de datos
      await initializeDatabase();

      // Iniciar servidor
      const PORT = process.env.PORT || 3000;
      this.server.listen(PORT, () => {
        console.log('🚀 Servidor iniciado correctamente');
        console.log(`📡 API disponible en: http://localhost:${PORT}`);
        console.log(`📊 Dashboard en: http://localhost:${PORT}/dashboard`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        console.log('🔌 WebSocket habilitado para tiempo real');
      });

      // Manejo graceful de shutdown
      process.on('SIGTERM', this.gracefulShutdown);
      process.on('SIGINT', this.gracefulShutdown);

    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }

  private gracefulShutdown = (): void => {
    console.log('🛑 Iniciando cierre graceful del servidor...');
    
    this.server.close(() => {
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.log('⚠️ Forzando cierre del servidor');
      process.exit(1);
    }, 10000);
  };

  // Método para enviar actualizaciones en tiempo real
  public broadcastSensorUpdate(data: any): void {
    this.io.to('sensor-updates').emit('sensor-data', data);
  }
}

export default App;