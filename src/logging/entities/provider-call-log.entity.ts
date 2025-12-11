import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'provider_call_logs' })
export class ProviderCallLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider_name: string;

  @Column('jsonb', { nullable: true })
  request_payload?: any;

  @Column('jsonb', { nullable: true })
  response_payload?: any;

  @Column({ default: false })
  success: boolean;

  @Column({ nullable: true })
  error_message?: string;

  @Column({ nullable: true, type: 'int' })
  latency_ms?: number;

  @Column({ nullable: true })
  error_id?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
