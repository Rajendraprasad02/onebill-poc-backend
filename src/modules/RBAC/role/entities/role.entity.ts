import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: 1 })
  activeFlag: number;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  permissions: RolePermission[];
}
