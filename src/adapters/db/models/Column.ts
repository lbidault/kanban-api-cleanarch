import { TaskModel } from "./Task";

export type ColumnModel = {
  id: string;
  boardId: string;
  name: string;
  tasks: TaskModel[];
};
