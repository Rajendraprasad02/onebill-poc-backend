import { BillDetail } from 'modules/bill-details/entities/bill-detail.entity';
import { CardDetails } from 'modules/card-details/entities/card-detail.entity';
import { Invoice } from 'modules/gmail/entities/gmail.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salt: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  isUpdated: number;

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];

  @Column({ nullable: true })
  googleId: string; // Store Google ID to identify Google users

  @OneToMany(() => CardDetails, (card) => card.user, { cascade: true })
  cards: CardDetails[];

  @OneToMany(() => BillDetail, (card) => card.user, { cascade: true })
  billDetail: BillDetail[];
}
