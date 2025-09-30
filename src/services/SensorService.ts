import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SensorReading } from '../entities/SensorReading';
import { SensorData, AnalyticsData, ChartDataPoint } from '../types/interfaces';

export class SensorService {
  private sensorRepository: Repository<SensorReading>;

  constructor() {
    this.sensorRepository = AppDataSource.getRepository(SensorReading);
  }

  async saveSensorData(data: SensorData): Promise<SensorReading> {
    const reading = new SensorReading();
    reading.sensor1 = data.sensor1;
    reading.sensor2 = data.sensor2;
    reading.sensor3 = data.sensor3;
    reading.sensor4 = data.sensor4;
    reading.timestamp = data.timestamp;

    return await this.sensorRepository.save(reading);
  }

  async getAllReadings(limit: number = 100): Promise<SensorReading[]> {
    return await this.sensorRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getReadingsByDateRange(startDate: Date, endDate: Date): Promise<SensorReading[]> {
    return await this.sensorRepository
      .createQueryBuilder('reading')
      .where('reading.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('reading.createdAt', 'ASC')
      .getMany();
  }

  async getLatestReading(): Promise<SensorReading | null> {
    return await this.sensorRepository.findOne({
      order: { createdAt: 'DESC' },
    });
  }

  async getAnalytics(hours: number = 24): Promise<AnalyticsData> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const readings = await this.getReadingsByDateRange(startDate, endDate);

    if (readings.length === 0) {
      return {
        totalReadings: 0,
        averageValues: { sensor1: 0, sensor2: 0, sensor3: 0, sensor4: 0 },
        minValues: { sensor1: 0, sensor2: 0, sensor3: 0, sensor4: 0 },
        maxValues: { sensor1: 0, sensor2: 0, sensor3: 0, sensor4: 0 },
        alertsCount: 0,
        timeRange: { from: startDate, to: endDate },
      };
    }

    // Calcular estadísticas
    const totalReadings = readings.length;
    let alertsCount = 0;

    const stats = readings.reduce(
      (acc, reading) => {
        // Sumar valores para promedio
        acc.sum.sensor1 += reading.sensor1;
        acc.sum.sensor2 += reading.sensor2;
        acc.sum.sensor3 += reading.sensor3;
        acc.sum.sensor4 += reading.sensor4;

        // Encontrar mínimos
        acc.min.sensor1 = Math.min(acc.min.sensor1, reading.sensor1);
        acc.min.sensor2 = Math.min(acc.min.sensor2, reading.sensor2);
        acc.min.sensor3 = Math.min(acc.min.sensor3, reading.sensor3);
        acc.min.sensor4 = Math.min(acc.min.sensor4, reading.sensor4);

        // Encontrar máximos
        acc.max.sensor1 = Math.max(acc.max.sensor1, reading.sensor1);
        acc.max.sensor2 = Math.max(acc.max.sensor2, reading.sensor2);
        acc.max.sensor3 = Math.max(acc.max.sensor3, reading.sensor3);
        acc.max.sensor4 = Math.max(acc.max.sensor4, reading.sensor4);

        // Contar alertas
        const alerts = reading.getAlertsStatus();
        alertsCount += alerts.filter(alert => alert).length;

        return acc;
      },
      {
        sum: { sensor1: 0, sensor2: 0, sensor3: 0, sensor4: 0 },
        min: { 
          sensor1: readings[0].sensor1, 
          sensor2: readings[0].sensor2, 
          sensor3: readings[0].sensor3, 
          sensor4: readings[0].sensor4 
        },
        max: { 
          sensor1: readings[0].sensor1, 
          sensor2: readings[0].sensor2, 
          sensor3: readings[0].sensor3, 
          sensor4: readings[0].sensor4 
        },
      }
    );

    return {
      totalReadings,
      averageValues: {
        sensor1: Math.round((stats.sum.sensor1 / totalReadings) * 100) / 100,
        sensor2: Math.round((stats.sum.sensor2 / totalReadings) * 100) / 100,
        sensor3: Math.round((stats.sum.sensor3 / totalReadings) * 100) / 100,
        sensor4: Math.round((stats.sum.sensor4 / totalReadings) * 100) / 100,
      },
      minValues: stats.min,
      maxValues: stats.max,
      alertsCount,
      timeRange: { from: startDate, to: endDate },
    };
  }

  async getChartData(hours: number = 1): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const readings = await this.getReadingsByDateRange(startDate, endDate);

    return readings.map(reading => ({
      timestamp: reading.timestamp,
      sensor1: reading.sensor1,
      sensor2: reading.sensor2,
      sensor3: reading.sensor3,
      sensor4: reading.sensor4,
    }));
  }

  async deleteOldReadings(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.sensorRepository
      .createQueryBuilder()
      .delete()
      .from(SensorReading)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}