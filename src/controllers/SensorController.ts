import { Request, Response } from 'express';
import { SensorService } from '../services/SensorService';
import { SensorData } from '../types/interfaces';

export class SensorController {
  private sensorService: SensorService;

  constructor() {
    this.sensorService = new SensorService();
  }

  // POST /api/sensors - Recibir datos del ESP32
  receiveSensorData = async (req: Request, res: Response): Promise<void> => {
    try {
      const sensorData: SensorData = req.body;

      // Validar datos
      if (!this.validateSensorData(sensorData)) {
        res.status(400).json({ 
          error: 'Datos de sensores inválidos',
          received: sensorData 
        });
        return;
      }

      // Guardar en base de datos
      const savedReading = await this.sensorService.saveSensorData(sensorData);

      console.log('📊 Nuevos datos recibidos:', {
        timestamp: new Date(sensorData.timestamp * 1000).toISOString(),
        sensors: [sensorData.sensor1, sensorData.sensor2, sensorData.sensor3, sensorData.sensor4]
      });

      res.status(201).json({
        success: true,
        data: savedReading,
        message: 'Datos guardados correctamente'
      });

    } catch (error) {
      console.error('Error al procesar datos de sensores:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // GET /api/sensors/latest - Obtener última lectura
  getLatestReading = async (req: Request, res: Response): Promise<void> => {
    try {
      const latestReading = await this.sensorService.getLatestReading();
      
      if (!latestReading) {
        res.status(404).json({ message: 'No hay lecturas disponibles' });
        return;
      }

      res.json({
        success: true,
        data: latestReading
      });

    } catch (error) {
      console.error('Error al obtener última lectura:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // GET /api/sensors/readings - Obtener historial de lecturas
  getReadings = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const readings = await this.sensorService.getAllReadings(limit);

      res.json({
        success: true,
        data: readings,
        count: readings.length
      });

    } catch (error) {
      console.error('Error al obtener lecturas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // GET /api/sensors/analytics - Obtener análisis estadístico
  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const analytics = await this.sensorService.getAnalytics(hours);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Error al obtener analytics:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // GET /api/sensors/chart-data - Obtener datos para gráficos
  getChartData = async (req: Request, res: Response): Promise<void> => {
    try {
      const hours = parseInt(req.query.hours as string) || 1;
      const chartData = await this.sensorService.getChartData(hours);

      res.json({
        success: true,
        data: chartData,
        count: chartData.length
      });

    } catch (error) {
      console.error('Error al obtener datos del gráfico:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  // GET /api/sensors/range - Obtener lecturas por rango de fechas
  getReadingsByRange = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren startDate y endDate' 
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Formato de fecha inválido' 
        });
        return;
      }

      const readings = await this.sensorService.getReadingsByDateRange(start, end);

      res.json({
        success: true,
        data: readings,
        count: readings.length,
        range: { startDate: start, endDate: end }
      });

    } catch (error) {
      console.error('Error al obtener lecturas por rango:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  private validateSensorData(data: SensorData): boolean {
    return (
      typeof data.sensor1 === 'number' &&
      typeof data.sensor2 === 'number' &&
      typeof data.sensor3 === 'number' &&
      typeof data.sensor4 === 'number' &&
      typeof data.timestamp === 'number' &&
      data.sensor1 >= 0 &&
      data.sensor2 >= 0 &&
      data.sensor3 >= 0 &&
      data.sensor4 >= 0 &&
      data.timestamp > 0
    );
  }
}