import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user';

@Entity({ name: 'book' })
export class BookEntity {
  @PrimaryGeneratedColumn()
    id!: number;

  @OneToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id'})
    user_id!: UserEntity | number;

  @Column()
    title!: string;

  @Column()
    description!: string;
  
  @Column()
    release_date!: Date;
}
