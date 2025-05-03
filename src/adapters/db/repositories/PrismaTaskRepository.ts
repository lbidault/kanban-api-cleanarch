import { TaskRepository } from "../../../core/repositories/TaskRepository";
import { Task } from "../../../core/entities/Task";
import prisma from "../../../client";
import { PrismaTaskMapper } from "../mappers/PrismaTaskMapper";
import { TaskModel } from "../models/Task";
import { TaskErrors } from "../../../core/errors/TaskErrors";

const taskMapper = new PrismaTaskMapper();

export class PrismaTaskRepository implements TaskRepository {
  async create(task: Task): Promise<Task> {
    const taskModel: TaskModel = taskMapper.fromDomain(task);
    const createdTaskModel = await prisma.task.create({
      data: {
        id: taskModel.id,
        title: taskModel.title,
        description: taskModel.description,
        status: taskModel.status,
        subtasks: {
          create: taskModel.subtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            isCompleted: subtask.isCompleted,
          })),
        },
        columnId: taskModel.columnId,
      },
      include: {
        subtasks: true,
      },
    });
    const createdTask = taskMapper.toDomain(createdTaskModel);
    return createdTask;
  }
  async findById(id: string): Promise<Task | null> {
    const taskModel = await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: true,
      },
    });

    if (!taskModel) {
      return null;
    }
    const task = taskMapper.toDomain(taskModel);
    return task;
  }
  async findByTitle(title: string): Promise<Task | null> {
    const taskModel = await prisma.task.findUnique({
      where: { title },
      include: {
        subtasks: true,
      },
    });

    if (!taskModel) {
      return null;
    }
    const task = taskMapper.toDomain(taskModel);
    return task;
  }
  async findAll(boardId: string): Promise<Task[]> {
    throw new Error("Method not implemented.");
  }
  async update(task: Task): Promise<Task> {
    const taskModel: TaskModel = taskMapper.fromDomain(task);
    const updatedTaskModel = await prisma.task.update({
      where: { id: taskModel.id },
      data: {
        title: taskModel.title,
        description: taskModel.description,
        status: taskModel.status,
        subtasks: {
          updateMany: taskModel.subtasks.map((subtask) => ({
            where: { id: subtask.id },
            data: {
              title: subtask.title,
              isCompleted: subtask.isCompleted,
            },
          })),
        },
      },
      include: {
        subtasks: true,
      },
    });
    const updatedTask = taskMapper.toDomain(updatedTaskModel);
    return updatedTask;
  }
  async delete(id: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new TaskErrors.NotFound();
    }

    await prisma.task.delete({
      where: { id },
    });
  }
}
