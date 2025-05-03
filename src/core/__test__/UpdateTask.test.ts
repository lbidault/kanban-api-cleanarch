import { UpdateTask } from "../usecases/UpdateTask";
import { Task } from "../entities/Task";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
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

const taskDb = new Map<string, Task>();
const boardDb = new Map<string, Board>();

describe("Unit - Update Task", () => {
  let task: Task;
  let board: Board;
  let updateTask: UpdateTask;
  let boardRepository: InMemoryBoardRepository;
  let taskRepository: InMemoryTaskRepository;
  let idGateway: V4IdGateway;

  beforeAll(async () => {
    idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    taskRepository = new InMemoryTaskRepository(taskDb);
    updateTask = new UpdateTask(boardRepository, taskRepository);

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
    await taskRepository.create(task);
  });
  
  it("should update subtasks status", async () => {
    const input = {
      boardId: board.props.id,
      taskId: task.props.id,
      subtasks: [task.props.subtasks[0].props.id],
      // status: task.props.status,
    };

    expect(task.props.subtasks[0].props.isCompleted).toBe(false);

    const output = await updateTask.execute(input);

    expect(output.props.subtasks.length).toBe(task.props.subtasks.length);
    expect(output.props.subtasks[0].props.isCompleted).toBe(true);

    const result = await taskRepository.findById(output.props.id);
    expect(result).toEqual(output);
  });

  it("should come back to initial subtask status", async () => {
    const input = {
      boardId: board.props.id,
      taskId: task.props.id,
      subtasks: [task.props.subtasks[0].props.id],
    };

    expect(task.props.subtasks[0].props.isCompleted).toBe(false);

    // 2 calls
    const ouput1 = await updateTask.execute(input);
    expect(ouput1.props.subtasks[0].props.isCompleted).toBe(true);
    const output2 = await updateTask.execute(input);

    expect(output2.props.subtasks.length).toBe(task.props.subtasks.length);
    expect(output2.props.subtasks[0].props.isCompleted).toBe(false);

    const result = await taskRepository.findById(output2.props.id);
    expect(result).toEqual(output2);
  });

  it("should update task status", async () => {
    console.warn("Update task status test is not implemented yet");
    expect(true).toBe(true);
  });
});
