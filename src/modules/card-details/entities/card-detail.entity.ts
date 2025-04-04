import { User } from 'modules/users/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity({ schema: 'auth', name: 'card_details' })
export class CardDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  cardHolder: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  cardNumber: string;

  @Column({ type: 'varchar', length: 7 }) // Stores as 'MM/YY' or 'YYYY-MM'
  expiryDate: string;

  @Column({ type: 'varchar', length: 4 })
  cvc: string;

  @Column({ type: 'boolean', nullable: true })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.cards, { onDelete: 'CASCADE' })
  user: User;
}
