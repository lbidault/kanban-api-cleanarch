import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";
import { SubtaskErrors } from "../errors/SubtaskErrors";
import { BoardErrors } from "../errors/BoardErrors";
import { BoardRepository } from "../repositories/BoardRepository";
import { ColumnErrors } from "../errors/ColumnErrors";

export interface UpdateTaskInput {
  boardId: string;
  taskId: string;
  subtasks: string[];
  status?: string;
}

export class UpdateTask implements UseCase<UpdateTaskInput, Task> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(input: UpdateTaskInput): Promise<Task> {
    const { boardId, taskId, subtasks, status } = input;

    const existingBoard = await this.boardRepository.findById(boardId);
    if (!existingBoard) {
      throw new BoardErrors.NotFound();
    }

    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    // subtasks
    subtasks.forEach((subtaskId) => {
      const existingSubtask = existingTask.props.subtasks.find(
        (sub) => sub.props.id === subtaskId
      );
      if (!existingSubtask) {
        throw new SubtaskErrors.NotFound();
      }
      existingSubtask.toggle();
    });

    // status
    if (status) {
      const existingColumn = existingBoard.props.columns.find(
        (column) => column.props.name === status
      );
      if (!existingColumn) {
        throw new ColumnErrors.NotFound();
      }

      existingTask.update({ status });
      // TODO: Update column
      console.warn("UpdateTask Implementation not complete : Update column");
    }


    await this.taskRepository.update(existingTask);

    return existingTask;
  }
}
