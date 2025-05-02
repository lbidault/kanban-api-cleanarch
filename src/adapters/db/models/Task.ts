import { SubtaskModel } from "./Subtask";

export type TaskModel = {
  id: string;
  columnId: string;
  title: string;
  description: string;
  subtasks: SubtaskModel[];
};
