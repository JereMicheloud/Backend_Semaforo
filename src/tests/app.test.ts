import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import App from '../app';

describe('Backend Semáforo - Tests', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    // Inicializar la aplicación
    app = new App();
    await new Promise<void>((resolve) => {
      server = app.server.listen(0, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Cerrar servidor después de los tests
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  describe('Health Check', () => {
    test('GET /health debe retornar status OK', async () => {
      const response = await request(app.app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
    });
  });

  describe('Ruta Principal', () => {
    test('GET / debe retornar información de la API', async () => {
      const response = await request(app.app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Backend Sistema de Semáforos');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('API Sensores', () => {
    const sampleSensorData = {
      sensor1: 25.43,
      sensor2: 30.12,
      sensor3: 15.67,
      sensor4: 42.89,
      timestamp: Math.floor(Date.now() / 1000)
    };

    test('POST /api/sensors debe aceptar datos válidos', async () => {
      const response = await request(app.app)
        .post('/api/sensors')
        .send(sampleSensorData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Datos guardados correctamente');
    });

    test('POST /api/sensors debe rechazar datos inválidos', async () => {
      const invalidData = {
        sensor1: 'invalid',
        sensor2: 30.12,
        sensor3: 15.67,
        sensor4: 42.89,
        timestamp: 'invalid'
      };

      const response = await request(app.app)
        .post('/api/sensors')
        .send(invalidData)
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/sensors/latest debe retornar la última lectura', async () => {
      // Primero insertar datos
      await request(app.app)
        .post('/api/sensors')
        .send(sampleSensorData)
        .set('Content-Type', 'application/json');

      // Luego obtener la última lectura
      const response = await request(app.app)
        .get('/api/sensors/latest')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sensor1');
      expect(response.body.data).toHaveProperty('sensor2');
      expect(response.body.data).toHaveProperty('sensor3');
      expect(response.body.data).toHaveProperty('sensor4');
    });

    test('GET /api/sensors/readings debe retornar historial', async () => {
      const response = await request(app.app)
        .get('/api/sensors/readings?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/sensors/analytics debe retornar estadísticas', async () => {
      const response = await request(app.app)
        .get('/api/sensors/analytics?hours=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalReadings');
      expect(response.body.data).toHaveProperty('averageValues');
      expect(response.body.data).toHaveProperty('alertsCount');
    });

    test('GET /api/sensors/chart-data debe retornar datos para gráficos', async () => {
      const response = await request(app.app)
        .get('/api/sensors/chart-data?hours=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Manejo de Errores', () => {
    test('Ruta no encontrada debe retornar 404', async () => {
      const response = await request(app.app)
        .get('/ruta-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Ruta no encontrada');
    });
  });

  describe('Validación de Datos', () => {
    test('Debe validar que todos los sensores sean números positivos', async () => {
      const invalidData = {
        sensor1: -10,
        sensor2: 30.12,
        sensor3: 15.67,
        sensor4: 42.89,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const response = await request(app.app)
        .post('/api/sensors')
        .send(invalidData)
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Debe requerir todos los campos obligatorios', async () => {
      const incompleteData = {
        sensor1: 25.43,
        sensor2: 30.12
        // Faltan sensor3, sensor4 y timestamp
      };

      const response = await request(app.app)
        .post('/api/sensors')
        .send(incompleteData)
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});