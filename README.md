# Backend Sistema de Semáforos 🚦

Backend completo en TypeScript para sistema de monitoreo de semáforos con sensores ESP32.

## 📋 Descripción

Este proyecto es el backend para un sistema de control y monitoreo de semáforos que recibe datos de 4 sensores ultrasónicos conectados a un ESP32. Incluye API REST, WebSockets para tiempo real, dashboard web interactivo y sistema de análisis de datos.

## 🚀 Tecnologías

- **Backend**: Node.js + TypeScript + Express
- **Base de Datos**: SQLite con TypeORM
- **Tiempo Real**: Socket.IO
- **Visualización**: Chart.js
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## 📊 Funcionalidades

### API REST
- ✅ Recepción de datos de sensores desde ESP32
- ✅ Historial completo de lecturas
- ✅ Análisis estadístico (promedios, máximos, mínimos)
- ✅ Sistema de alertas por umbrales
- ✅ Filtros por rango de fechas

### Dashboard Web
- 📈 Gráficos en tiempo real
- 📊 Estadísticas por período (1h, 6h, 24h, 7d)
- ⚠️ Alertas visuales por sensor
- 🔌 Actualizaciones automáticas via WebSocket

### Monitoreo
- 🏥 Health check endpoint
- 📊 Métricas de rendimiento
- 🛡️ Manejo robusto de errores
- 🔒 Seguridad integrada

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/JereMicheloud/Backend_Semaforo.git
cd Backend_Semaforo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env según necesidades
```

4. **Compilar TypeScript**
```bash
npm run build
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### URLs importantes
- **API**: `http://localhost:3000/api/sensors`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Health Check**: `http://localhost:3000/health`

## 📡 API Endpoints

### Sensores
```http
POST /api/sensors
Content-Type: application/json

{
  "sensor1": 25.43,
  "sensor2": 30.12,
  "sensor3": 15.67,
  "sensor4": 42.89,
  "timestamp": 1234567890
}
```

```http
GET /api/sensors/latest          # Última lectura
GET /api/sensors/readings?limit=100    # Historial
GET /api/sensors/analytics?hours=24    # Estadísticas
GET /api/sensors/chart-data?hours=1    # Datos para gráficos
GET /api/sensors/range?startDate=2024-01-01&endDate=2024-01-02
```

## 📈 Ejemplos de Uso

### Envío desde ESP32
```cpp
// Código Arduino/ESP32
String jsonPayload = "{";
jsonPayload += "\"sensor1\":" + String(distance1) + ",";
jsonPayload += "\"sensor2\":" + String(distance2) + ",";
jsonPayload += "\"sensor3\":" + String(distance3) + ",";
jsonPayload += "\"sensor4\":" + String(distance4) + ",";
jsonPayload += "\"timestamp\":" + String(currentTime);
jsonPayload += "}";

// Enviar via HTTP POST
```

### Integración WebSocket
```javascript
const socket = io('http://localhost:3000');
socket.emit('subscribe-sensors');

socket.on('sensor-data', (data) => {
  console.log('Nuevos datos:', data);
});
```

## 🔧 Configuración

### Variables de entorno (.env)
```env
PORT=3000
NODE_ENV=development
DB_PATH=./database.sqlite
SENSOR_COUNT=4
ALERT_THRESHOLD_MIN=10
ALERT_THRESHOLD_MAX=200
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📊 Estructura de Datos

### Modelo de Sensor Reading
```typescript
interface SensorData {
  sensor1: number;    // Distancia sensor 1 (cm)
  sensor2: number;    // Distancia sensor 2 (cm)
  sensor3: number;    // Distancia sensor 3 (cm)
  sensor4: number;    // Distancia sensor 4 (cm)
  timestamp: number;  // Unix timestamp
}
```

### Respuesta Analytics
```json
{
  "totalReadings": 1440,
  "averageValues": {
    "sensor1": 45.2,
    "sensor2": 32.1,
    "sensor3": 67.8,
    "sensor4": 28.4
  },
  "alertsCount": 12,
  "timeRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-02T00:00:00Z"
  }
}
```

## 🏗️ Estructura del Proyecto

```
Backend_Semaforo/
├── src/
│   ├── entities/          # Modelos TypeORM
│   ├── controllers/       # Controladores Express
│   ├── services/          # Lógica de negocio
│   ├── routes/           # Rutas API
│   ├── config/           # Configuración DB
│   ├── types/            # Interfaces TypeScript
│   ├── app.ts           # Aplicación Express
│   └── server.ts        # Punto de entrada
├── public/              # Dashboard web estático
├── dist/               # Código compilado
└── package.json
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Test manual con curl
curl -X POST http://localhost:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"sensor1":25.43,"sensor2":30.12,"sensor3":15.67,"sensor4":42.89,"timestamp":1234567890}'
```

## 🚀 Despliegue

### Docker (Próximamente)
```dockerfile
# Dockerfile incluido para containerización
FROM node:18-alpine
# ... configuración
```

### Railway/Render
1. Conectar repositorio
2. Configurar variables de entorno
3. Ejecutar `npm run build && npm start`

## 📝 Roadmap

- [ ] Tests automatizados (Jest)
- [ ] Docker & Docker Compose
- [ ] Documentación Swagger/OpenAPI
- [ ] Autenticación JWT
- [ ] Notificaciones push
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Integración con bases de datos externas

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 👨‍💻 Autor

**Jeremy Micheloud**
- GitHub: [@JereMicheloud](https://github.com/JereMicheloud)
- Proyecto: Comunicación de Datos - 2025

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
