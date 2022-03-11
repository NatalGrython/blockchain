import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlockChain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { unique: true })
  hash: string;

  @Column("text")
  block: string;
}
