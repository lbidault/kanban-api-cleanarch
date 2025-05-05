import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";
import { BoardErrors } from "../errors/BoardErrors";
import { BoardRepository } from "../repositories/BoardRepository";
import { ColumnErrors } from "../errors/ColumnErrors";

export interface UpdateTaskStatusInput {
  taskId: string;
  boardId: string;
  status: string;
}

export class UpdateTaskStatus implements UseCase<UpdateTaskStatusInput, Task> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(input: UpdateTaskStatusInput): Promise<Task> {
    const { taskId, boardId, status } = input;

    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    const existingBoard = await this.boardRepository.findById(boardId);
    if (!existingBoard) {
      throw new BoardErrors.NotFound();
    }

    const existingColumn = existingBoard.props.columns.find(
      (column) => column.props.name === status
    );
    if (!existingColumn) {
      throw new ColumnErrors.NotFound();
    }

    existingTask.update({ status });

    await this.taskRepository.update(existingTask);

    return existingTask;
  }
}
