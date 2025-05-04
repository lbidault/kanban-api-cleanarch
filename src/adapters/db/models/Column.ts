import { TaskModel } from "./Task";

export type ColumnModel = {
  boardId: string;
  name: string;

  tasks: TaskModel[];
};
