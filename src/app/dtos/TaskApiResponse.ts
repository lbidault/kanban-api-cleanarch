import { Task } from "../../core/entities/Task";
import { Mapper } from "../../core/Mapper";

export type TaskApiResponse = {
  id: string;
  status: string;
  title: string;
  description: string;
  updatedAt: Date;
  subtasks: {
    id: string;
    title: string;
    isCompleted: boolean;
  }[];
};

export class TaskApiResponseMapper implements Mapper<TaskApiResponse, Task> {
  fromDomain(task: Task): TaskApiResponse {
    return {
      id: task.props.id,
      status: task.props.status,
      title: task.props.title,
      description: task.props.description,
      updatedAt: task.props.updatedAt,
      subtasks: task.props.subtasks.map((subtask) => ({
        id: subtask.props.id,
        title: subtask.props.title,
        isCompleted: subtask.props.isCompleted,
      })),
    };
  }
}
