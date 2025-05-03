import { TaskModel } from "./Task";

export type ColumnModel = {
  id: string;
  name: string;
  tasks: TaskModel[];

  boardId: string;
};
