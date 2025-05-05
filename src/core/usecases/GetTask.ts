import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";

export interface GetTaskInput {
  id: string;
}

export class GetTask implements UseCase<GetTaskInput, Task> {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: GetTaskInput): Promise<Task> {
    const { id } = input;
    const existingTask = await this.taskRepository.findById(id);

    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    return existingTask;
  }
}
