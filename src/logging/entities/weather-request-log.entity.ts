import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'weather_request_logs' })
export class WeatherRequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ip?: string;

  @Column('jsonb', { nullable: true })
  request_payload?: any;

  @Column({ type: 'text' })
  status: 'success' | 'fallback' | 'error';

  @Column({ nullable: true })
  provider_used?: string;

  @Column({ type: 'timestamptz', nullable: true })
  response_timestamp?: Date;

  @Column({ nullable: true })
  error_id?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
