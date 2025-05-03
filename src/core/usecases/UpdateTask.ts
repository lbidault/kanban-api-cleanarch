import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";
import { SubtaskErrors } from "../errors/SubtaskErrors";
import { BoardErrors } from "../errors/BoardErrors";
import { BoardRepository } from "../repositories/BoardRepository";
import { ColumnErrors } from "../errors/ColumnErrors";

interface SubtaskInput {
  id: string;
  title: string;
}

export interface UpdateTaskInput {
  boardId: string;
  taskId: string;
  subtasks: SubtaskInput[];
  status: string;
}

export class UpdateTask implements UseCase<UpdateTaskInput, Task> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(input: UpdateTaskInput): Promise<Task> {
    const { boardId, subtasks, status } = input;

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

    const existingTask = await this.taskRepository.findById(boardId);
    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    subtasks.forEach((subtask) => {
      const existingSubtask = existingTask.props.subtasks.find(
        (sub) => sub.props.id === subtask.id
      );
      if (!existingSubtask) {
        throw new SubtaskErrors.NotFound();
      }
      existingSubtask.check();
    });

    existingTask.update({ status });

    await this.taskRepository.update(existingTask);

    // TODO: Update column
    console.warn("UpdateTask Implementation not complete : Update column");
    return existingTask;
  }
}
