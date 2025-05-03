import { TaskRepository } from "../../../repositories/TaskRepository";
import { Task } from "../../../entities/Task";

export class InMemoryTaskRepository implements TaskRepository {
  constructor(private readonly db: Map<string, Task>) {}
  async create(task: Task): Promise<Task> {
    this.db.set(task.props.id, task);
    return Promise.resolve(task);
  }
  async findById(id: string): Promise<Task | null> {
    const task = this.db.get(id) ?? null;
    return Promise.resolve(task);
  }
  async findByTitle(title: string): Promise<Task | null> {
    const task = Array.from(this.db.values()).find(
      (task) => task.props.title == title
    );
    return Promise.resolve(task ?? null);
  }
  async findAll(): Promise<Task[]> {
    const task = Array.from(this.db.values());
    return Promise.resolve(task);
  }
  async update(task: Task): Promise<Task> {
    this.db.set(task.props.id, task);
    return Promise.resolve(task);
  }
  async delete(id: string): Promise<void> {
    this.db.delete(id);
    return;
  }
}
