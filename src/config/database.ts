import { DataSource } from 'typeorm';
import { SensorReading } from '../entities/SensorReading';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || './database.sqlite',
  synchronize: true, // En producción cambiar a false y usar migraciones
  logging: process.env.NODE_ENV === 'development',
  entities: [SensorReading],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};