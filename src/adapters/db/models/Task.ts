import { SubtaskModel } from "./Subtask";

export type TaskModel = {
  id: string;
  title: string;
  description: string;
  subtasks: SubtaskModel[];
  status: string;

  columnId: string;
};
