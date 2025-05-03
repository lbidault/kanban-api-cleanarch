import { Task } from "../entities/Task";

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByTitle(title: string): Promise<Task | null>;
  findAll(boardId: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}

