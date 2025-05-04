import { SubtaskModel } from "./Subtask";

export type TaskModel = {
  id: string;
  title: string;
  description: string;
  subtasks: SubtaskModel[];
  createdAt: Date;
  updatedAt: Date;

  boardId: string;
  status: string;
};
