import { Column } from "../entities/Column";

export interface ColumnRepository {
  create(column: Column): Promise<Column>;
  createMany(columns: Column[]): Promise<Column[]>;
  findAll(boarId:string): Promise<Column[]>;
  delete(id: string): Promise<void>;
}

