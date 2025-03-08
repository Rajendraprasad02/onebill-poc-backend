import { User } from 'modules/users/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email_id: string; // Gmail message ID

  @Column()
  sender: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  snippet: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  user_gmail: string;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
