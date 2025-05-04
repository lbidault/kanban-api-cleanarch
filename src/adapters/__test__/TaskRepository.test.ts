import { PrismaTaskRepository } from "../db/repositories/PrismaTaskRepository";
import { PrismaBoardRepository } from "../db/repositories/PrismaBoardRepository";
import { Task } from "../../core/entities/Task";
import { Board } from "../../core/entities/Board";
import { Column } from "../../core/entities/Column";
import { V4IdGateway } from "../gateways/V4IdGateway";
import prisma from "../../client";
import {
  afterEach,
  beforeAll,
  afterAll,
  describe,
  expect,
  it,
} from "@jest/globals";
import { Subtask } from "../../core/entities/Subtask";

describe("Integration - Prisma Task Repository", function () {
  let boardRepository: PrismaBoardRepository;
  let board: Board;
  let column: Column;
  let taskRepository: PrismaTaskRepository;
  let task: Task;
  beforeAll(async () => {
    await prisma.$connect();
    const idGateway = new V4IdGateway();
    taskRepository = new PrismaTaskRepository();
    boardRepository = new PrismaBoardRepository();

    const boardId = idGateway.generate();
    column = Column.create({ boardId, name: "Status" });
    board = Board.create({
      id: boardId,
      name: "Test Board",
      columns: [
        column,
        Column.create({ boardId, name: "Column 2" }),
      ],
    });

    task = Task.create({
      id: idGateway.generate(),
      title: "Test Task",
      description: "Test Description",
      status: column.props.name,
      subtasks: [
        Subtask.create({ id: idGateway.generate(), title: "Todo 1" }),
        Subtask.create({ id: idGateway.generate(), title: "Todo 2" }),
      ],
      boardId: column.props.boardId,
    });

    await boardRepository.create(board);
  });

  afterAll(async () => {
    await prisma.board.deleteMany();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.task.deleteMany();
  });

  it("should create a Task", async () => {
    await taskRepository.create(task);

    const savedTask = await prisma.task.findUnique({
      where: { id: task.props.id },
      include: { subtasks: true },
    });
    const existingColumn = await prisma.column.findUnique({
      where: { boardId_name: { boardId: task.props.boardId, name: savedTask!.status } },
    });

    expect(savedTask).not.toBeNull();
    expect(savedTask!.title).toBe(task.props.title);
    expect(savedTask!.description).toBe(task.props.description);
    expect(existingColumn!.name).toBe(task.props.status);

    const subNames = savedTask!.subtasks.map((c) => c.title).sort();
    const originalNames = task.props.subtasks.map((c) => c.props.title).sort();
    expect(subNames).toEqual(originalNames);
  });

  // it("should find a Task by id", async () => {
  //   await prisma.task.create({
  //     data: {
  //       id: task.props.id,
  //       title: task.props.title,
  //       description: task.props.description,
  //       columnId: task.props.columnId,
  //     },
  //   });
  //   const savedTask = await taskRepository.findById(task.props.id);

  //   expect(savedTask).not.toBeNull();
  //   expect(savedTask!.props.title).toBe(task.props.title);
  //   expect(savedTask!.props.description).toBe(task.props.description);
  //   expect(savedTask!.props.status).toBe(task.props.status);
  // });

  // it("should find a Task by title", async () => {
  //   await prisma.task.create({
  //     data: {
  //       id: task.props.id,
  //       title: task.props.title,
  //       description: task.props.description,
  //       columnId: task.props.columnId,
  //     },
  //   });
  //   const savedTask = await taskRepository.findByTitle(task.props.title);

  //   expect(savedTask).not.toBeNull();
  //   expect(savedTask!.props.title).toBe(task.props.title);
  //   expect(savedTask!.props.description).toBe(task.props.description);
  //   expect(savedTask!.props.status).toBe(task.props.status);
  // });

  // it("should find all Tasks", async () => {
  //   await prisma.task.create({
  //     data: {
  //       id: task.props.id,
  //       name: task.props.name,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     },
  //   });
  //   const Tasks = await taskRepository.findAll();

  //   expect(Tasks.length).toBe(1);
  //   expect(Tasks[0].props.name).toBe(Task.props.name);
  // });

  // it("should update Subtasks", async () => {
  //   await prisma.task.create({
  //     data: {
  //       id: task.props.id,
  //       title: task.props.title,
  //       description: task.props.description,
  //       subtasks: {
  //         create: task.props.subtasks.map((subtask) => ({
  //           id: subtask.props.id,
  //           title: subtask.props.title,
  //           isCompleted: subtask.props.isCompleted,
  //         })),
  //       },
  //       columnId: task.props.columnId,
  //     },
  //   });

  //   const subtask = task.props.subtasks[0];
  //   expect(subtask.props.isCompleted).toBe(false);

  //   subtask.toggle();
  //   await taskRepository.update(task);

  //   const savedSubask = await prisma.subtask.findUnique({
  //     where: { id: subtask.props.id },
  //   });
  //   expect(savedSubask).not.toBeNull();
  //   expect(savedSubask!.isCompleted).toBe(true);
  // });

  // it("should delete a Task", async () => {
  //   await prisma.task.create({
  //     data: {
  //       id: task.props.id,
  //       title: task.props.title,
  //       description: task.props.description,
  //       columnId: task.props.columnId,
  //     },
  //   });

  //   const savedTask = await prisma.task.findUnique({
  //     where: { id: task.props.id },
  //   });

  //   expect(savedTask).not.toBeNull();

  //   await taskRepository.delete(task.props.id);

  //   const deletedTask = await prisma.task.findUnique({
  //     where: { id: task.props.id },
  //   });

  //   expect(deletedTask).toBeNull();
  // });
});
