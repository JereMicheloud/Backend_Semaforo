import { Router } from 'express';
import { SensorController } from '../controllers/SensorController';

const router = Router();
const sensorController = new SensorController();

// Ruta para recibir datos del ESP32
router.post('/', sensorController.receiveSensorData);

// Ruta para obtener la última lectura
router.get('/latest', sensorController.getLatestReading);

// Ruta para obtener historial de lecturas
router.get('/readings', sensorController.getReadings);

// Ruta para obtener análisis estadístico
router.get('/analytics', sensorController.getAnalytics);

// Ruta para obtener datos para gráficos
router.get('/chart-data', sensorController.getChartData);

// Ruta para obtener lecturas por rango de fechas
router.get('/range', sensorController.getReadingsByRange);

export default router;