import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sensor_readings')
export class SensorReading {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('real')
  sensor1!: number;

  @Column('real')
  sensor2!: number;

  @Column('real')
  sensor3!: number;

  @Column('real')
  sensor4!: number;

  @Column('integer')
  timestamp!: number;

  @CreateDateColumn()
  createdAt!: Date;

  // Método para convertir timestamp Unix a Date
  getReadingDate(): Date {
    return new Date(this.timestamp * 1000);
  }

  // Método para obtener array de sensores
  getSensorValues(): number[] {
    return [this.sensor1, this.sensor2, this.sensor3, this.sensor4];
  }

  // Método para detectar sensores con alerta (distancia muy baja o muy alta)
  getAlertsStatus(minThreshold: number = 10, maxThreshold: number = 200): boolean[] {
    return this.getSensorValues().map(value => 
      value < minThreshold || value > maxThreshold
    );
  }
}