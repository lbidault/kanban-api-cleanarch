import { UseCase } from "./UseCase";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskErrors } from "../errors/TaskErrors";
import { SubtaskErrors } from "../errors/SubtaskErrors";

export interface UpdateSubtaskInput {
  taskId: string;
  subtaskId: string;
}

export class UpdateSubtask implements UseCase<UpdateSubtaskInput, Task> {
  constructor(
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(input: UpdateSubtaskInput): Promise<Task> {
    const { taskId, subtaskId } = input;

    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new TaskErrors.NotFound();
    }

    const existingSubtask = existingTask.props.subtasks.find(
      (sub) => sub.props.id === subtaskId
    );
    if (!existingSubtask) {
      throw new SubtaskErrors.NotFound();
    }
    existingSubtask.toggle();

    await this.taskRepository.update(existingTask);

    return existingTask;
  }
}
