export interface SensorData {
  sensor1: number;
  sensor2: number;
  sensor3: number;
  sensor4: number;
  timestamp: number;
}

export interface SensorAlert {
  sensorId: number;
  value: number;
  threshold: number;
  type: 'min' | 'max';
  timestamp: number;
}

export interface AnalyticsData {
  totalReadings: number;
  averageValues: {
    sensor1: number;
    sensor2: number;
    sensor3: number;
    sensor4: number;
  };
  minValues: {
    sensor1: number;
    sensor2: number;
    sensor3: number;
    sensor4: number;
  };
  maxValues: {
    sensor1: number;
    sensor2: number;
    sensor3: number;
    sensor4: number;
  };
  alertsCount: number;
  timeRange: {
    from: Date;
    to: Date;
  };
}

export interface ChartDataPoint {
  timestamp: number;
  sensor1: number;
  sensor2: number;
  sensor3: number;
  sensor4: number;
}