import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlockChainEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { unique: true })
  hash: string;

  @Column("text")
  block: string;
}
