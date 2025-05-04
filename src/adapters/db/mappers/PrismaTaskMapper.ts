import { TaskModel } from "../models/Task";
import { SubtaskModel } from "../models/Subtask";
import { Task } from "../../../core/entities/Task";
import { Subtask } from "../../../core/entities/Subtask";
import { Mapper } from "../../../core/Mapper";

export class PrismaTaskMapper implements Mapper<TaskModel, Task> {
  fromDomain(data: Task): TaskModel {
    return {
      id: data.props.id,
      title: data.props.title,
      description: data.props.description,
      createdAt: data.props.createdAt,
      updatedAt: data.props.updatedAt,
      subtasks: data.props.subtasks.map((subtask) => ({
        id: subtask.props.id,
        taskId: data.props.id,
        title: subtask.props.title,
        isCompleted: subtask.props.isCompleted,
      })),
      boardId: data.props.boardId,
      status: data.props.status,
    };
  }

  toDomain(raw: TaskModel): Task {
    return new Task({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      subtasks: raw.subtasks.map(
        (subtaskModel: SubtaskModel) =>
          new Subtask({
            id: subtaskModel.id,
            title: subtaskModel.title,
            isCompleted: subtaskModel.isCompleted,
          })
      ),
      boardId: raw.boardId,
      status: raw.status,
    });
  }
}
