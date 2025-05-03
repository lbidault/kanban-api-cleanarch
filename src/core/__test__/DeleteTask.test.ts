import { CreateTask } from "../usecases/CreateTask";
import { Task } from "../entities/Task";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { TaskErrors } from "../errors/TaskErrors";
import { Column } from "../entities/Column";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
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
import { DeleteTask } from "../usecases/DeleteTask";

const taskDb = new Map<string, Task>();
const boardDb = new Map<string, Board>();

describe("Unit - Delete Task", () => {
  let task: Task;
  let board: Board;
  let deleteTask: DeleteTask;
  let boardRepository: InMemoryBoardRepository;
  let taskRepository: InMemoryTaskRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    taskRepository = new InMemoryTaskRepository(taskDb);
    deleteTask = new DeleteTask(taskRepository);

    task = Task.create({
      id: idGateway.generate(),
      title: "Test Task",
      description: "Test Description",
      status: "Todo",
      subtasks: [
        Subtask.create({ id: idGateway.generate(), title: "Todo 1" }),
        Subtask.create({ id: idGateway.generate(), title: "Todo 2" }),
      ],
      columnId: idGateway.generate(),
    });

    board = Board.create({
      id: idGateway.generate(),
      name: "Test Board",
      columns: [
        Column.create({ id: idGateway.generate(), name: "Todo" }),
        Column.create({ id: idGateway.generate(), name: "Doing" }),
        Column.create({ id: idGateway.generate(), name: "Done" }),
      ],
    });
    await boardRepository.create(board);
  });

  afterAll(() => {
    boardDb.clear();
  });

  afterEach(() => {
    taskDb.clear();
  });

  beforeEach(async () => {
    await taskRepository.create(task);
  });

  it("should delete a task", async () => {
    const input = {
      id: task.props.id,
    };

    const stillExisting = await taskRepository.findById(task.props.id);
    expect(stillExisting).toBeInstanceOf(Task);
    await deleteTask.execute(input);
    const notExisting = await taskRepository.findById(task.props.id);
    expect(notExisting).toBeNull();
  });

  it("should fail to delete a task that does not exist", async () => {
    const input = {
      id: "non-existing-id",
    };

    const fail = () => deleteTask.execute(input);
    await expect(() => fail()).rejects.toThrow(TaskErrors.NotFound);
  });
});
