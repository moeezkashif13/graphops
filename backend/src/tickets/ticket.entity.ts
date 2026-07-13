import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tickets')
export class TicketEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string; // e.g. tk_6489

  @Column({ type: 'varchar', length: 255 })
  sender!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 50, default: 'processing' })
  status!: 'processing' | 'pending_approval' | 'resolved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  categories!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sentiment!: string;

  @Column({ type: 'text', nullable: true })
  finalDraft!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
