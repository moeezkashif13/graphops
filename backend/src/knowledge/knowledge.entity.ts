import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('knowledge_base')
export class KnowledgeBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 100 })
  category: string; // e.g., 'Technical' or 'Billing'

  // TypeORM stores pgvector rows cleanly as a raw string array format format: '[0.123, -0.456, ...]'
  @Column({ type: 'text', nullable: true })
  embedding: string;

  @CreateDateColumn()
  createdAt: Date;
}
