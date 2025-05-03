import { UseCase } from "./UseCase";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";

export interface DeleteTaskInput {
  id: string;
}

export class DeleteTask implements UseCase<DeleteTaskInput, void> {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    const { id } = input;
    const existingTask = await this.taskRepository.findById(id);

    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    await this.taskRepository.delete(existingTask.props.id);
  }
}
