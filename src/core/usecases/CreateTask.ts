import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";
import { IdGateway } from "../gateways/IdGateway";
import { BoardErrors } from "../errors/BoardErrors";
import { BoardRepository } from "../repositories/BoardRepository";
import { ColumnErrors } from "../errors/ColumnErrors";
import { Subtask } from "../entities/Subtask";

export interface CreateTaskInput {
  boardId: string;
  title: string;
  description: string;
  subtasks: string[];
  status: string;
}

export class CreateTask implements UseCase<CreateTaskInput, Task> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly taskRepository: TaskRepository,
    private readonly idGateway: IdGateway
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const { boardId, title, description, subtasks, status } = input;

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

    if (title.length < 3) {
      throw new TaskErrors.InvalidName();
    }

    const existingTask = await this.taskRepository.findByTitle(title);
    if (existingTask) {
      throw new TaskErrors.TitleAlreadyExists();
    }

    const task = Task.create({
      id: this.idGateway.generate(),
      title,
      description,
      status,
      subtasks: subtasks.map((subName) =>
        Subtask.create({
          id: this.idGateway.generate(),
          title: subName,
        })
      ),
      columnId: existingColumn.props.id,
    });

    await this.taskRepository.create(task);

    return task;
  }
}
