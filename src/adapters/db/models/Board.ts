import { ColumnModel } from "./Column";

export type BoardModel = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  columns: ColumnModel[];
};
