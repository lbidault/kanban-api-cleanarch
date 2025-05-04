import { CreateTask } from "../usecases/CreateTask";
import { Task } from "../entities/Task";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { TaskErrors } from "../errors/TaskErrors";
import { Column } from "../entities/Column";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from "@jest/globals";
import { InMemoryBoardRepository } from "./adapters/repositories/InMemoryBoardRepository";
import { InMemoryTaskRepository } from "./adapters/repositories/InMemoryTaskRepository";
import { Subtask } from "../entities/Subtask";
import { Board } from "../entities/Board";
import { BoardErrors } from "../errors/BoardErrors";
import { ColumnErrors } from "../errors/ColumnErrors";

const taskDb = new Map<string, Task>();
const boardDb = new Map<string, Board>();

describe("Unit - Create Task", () => {
  let task: Task;
  let board: Board;
  let createTask: CreateTask;
  let boardRepository: InMemoryBoardRepository;
  let taskRepository: InMemoryTaskRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    taskRepository = new InMemoryTaskRepository(taskDb);
    createTask = new CreateTask(boardRepository, taskRepository, idGateway);

    const boardId = idGateway.generate();
    board = Board.create({
      id: boardId,
      name: "Test Board",
      columns: [
        Column.create({ boardId, name: "Todo" }),
        Column.create({ boardId, name: "Doing" }),
        Column.create({ boardId, name: "Done" }),
      ],
    });

    task = Task.create({
      id: idGateway.generate(),
      title: "Test Task",
      description: "Test Description",
      status: "Todo",
      subtasks: [
        Subtask.create({ id: idGateway.generate(), title: "Todo 1" }),
        Subtask.create({ id: idGateway.generate(), title: "Todo 2" }),
      ],
      boardId: board.props.id,
    });

    await boardRepository.create(board);
  });

  afterAll(() => {
    boardDb.clear();
  });

  afterEach(() => {
    taskDb.clear();
  });

  it("should create a Task", async () => {
    const input = {
      boardId: board.props.id,
      title: task.props.title,
      description: task.props.description,
      subtasks: task.props.subtasks.map((sub) => sub.props.title),
      status: task.props.status,
    };

    const output = await createTask.execute(input);

    expect(output).toBeDefined();
    expect(output.props.title).toBe(input.title);
    expect(output.props.subtasks.length).toBe(input.subtasks.length);
    output.props.subtasks.forEach((sub, index) => {
      expect(sub.props.title).toBe(input.subtasks[index]);
    });
    expect(output.props.status).toBe(input.status);

    const result = await taskRepository.findById(output.props.id);
    expect(result).toEqual(output);
  });

  it("should fail to create a Task with the same title", async () => {
    const input = {
      boardId: board.props.id,
      title: task.props.title,
      description: task.props.description,
      subtasks: [],
      status: task.props.status,
    };

    await taskRepository.create(task);

    const fail = () => createTask.execute(input);
    await expect(() => fail()).rejects.toThrow(TaskErrors.TitleAlreadyExists);
  });

  it("should fail to create a Task with an invalid name", async () => {
    const input = {
      boardId: board.props.id,
      title: "ab",
      description: task.props.description,
      subtasks: [],
      status: task.props.status,
    };

    const fail = () => createTask.execute(input);
    await expect(() => fail()).rejects.toThrow(TaskErrors.InvalidName);
  });

  it("should fail to create a Task with an invalid boardId", async () => {
    const input = {
      boardId: "invalid-board-id",
      title: task.props.title,
      description: task.props.description,
      subtasks: [],
      status: task.props.status,
    };

    const fail = () => createTask.execute(input);
    await expect(() => fail()).rejects.toThrow(BoardErrors.NotFound);
  });

  it("should fail to create a Task with an invalid status", async () => {
    const input = {
      boardId: board.props.id,
      title: task.props.title,
      description: task.props.description,
      subtasks: [],
      status: "ToFinish",
    };

    const fail = () => createTask.execute(input);
    await expect(() => fail()).rejects.toThrow(ColumnErrors.NotFound);
  });
});
