import { Router } from "express";
import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { PrismaTaskRepository } from "../../adapters/db/repositories/PrismaTaskRepository";
import { CreateBoard, CreateBoardInput } from "../../core/usecases/CreateBoard";
import { CreateTask } from "../../core/usecases/CreateTask";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import { BoardApiResponseMapper } from "../dtos/BoardApiResponse";
import { TaskApiResponseMapper } from "../dtos/TaskApiResponse";
import { GetBoardList } from "../../core/usecases/GetBoardList";
import { GetBoard } from "../../core/usecases/GetBoard";
import { DeleteBoard } from "../../core/usecases/DeleteBoard";
import { BoardErrors } from "../../core/errors/BoardErrors";
import { ColumnErrors } from "../../core/errors/ColumnErrors";
import { TaskErrors } from "../../core/errors/TaskErrors";
import { DeleteTask } from "../../core/usecases/DeleteTask";
import { UpdateTask } from "../../core/usecases/UpdateTask";
import { SubtaskErrors } from "../../core/errors/SubtaskErrors";

const boardRouter = Router();
const boardRepository = new PrismaBoardRepository();
const taskRepository = new PrismaTaskRepository();
const boardApiResponseMapper = new BoardApiResponseMapper();
const taskApiResponseMapper = new TaskApiResponseMapper();
const idGateway = new V4IdGateway();

const createBoard = new CreateBoard(boardRepository, idGateway);
const getBoardList = new GetBoardList(boardRepository);
const getBoard = new GetBoard(boardRepository);
const deleteBoard = new DeleteBoard(boardRepository);
const createTask = new CreateTask(boardRepository, taskRepository, idGateway);
const deleteTask = new DeleteTask(taskRepository);
const updateTask = new UpdateTask(boardRepository, taskRepository);

boardRouter.post("/", async (req, res) => {
  const { name, columns }: CreateBoardInput = req.body;

  try {
    const board = await createBoard.execute({ name, columns });
    res.status(201).json(boardApiResponseMapper.fromDomain(board));
  } catch (error) {
    if (error instanceof BoardErrors.InvalidName) {
      res.status(401).json({ message: "Invalid Name" });
    } else if (error instanceof BoardErrors.NameAlreadyExists) {
      res.status(409).json({ message: "Name Already Exists" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

boardRouter.get("/", async (req, res) => {
  try {
    const boards = await getBoardList.execute();
    res.status(200).json(boards.map(boardApiResponseMapper.fromDomain));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

boardRouter.get("/:boardId", async (req, res) => {
  const { boardId } = req.params;

  try {
    const board = await getBoard.execute({ id: boardId });
    res.status(200).json(boardApiResponseMapper.fromDomain(board));
  } catch (error) {
    if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

boardRouter.delete("/:boardId", async (req, res) => {
  const { boardId } = req.params;

  try {
    await deleteBoard.execute({ id: boardId });
    res.status(204).json();
  } catch (error) {
    if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

boardRouter.post("/:boardId/tasks", async (req, res) => {
  const { boardId } = req.params;
  const { title, description, subtasks, status } = req.body;

  try {
    const task = await createTask.execute({
      boardId,
      title,
      description,
      subtasks,
      status,
    });
    res.status(201).json(taskApiResponseMapper.fromDomain(task));
  } catch (error) {
    if (error instanceof TaskErrors.InvalidName) {
      res.status(401).json({ message: "Invalid Name" });
    } else if (error instanceof TaskErrors.TitleAlreadyExists) {
      res.status(409).json({ message: "Title Already Exists" });
    } else if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else if (error instanceof ColumnErrors.NotFound) {
      res.status(404).json({ message: "Invalid Status Name" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

boardRouter.delete("/:boardId/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    await deleteTask.execute({ id: taskId });
    res.status(204).json();
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

boardRouter.patch("/:boardId/tasks/:taskId", async (req, res) => {
  const { boardId, taskId } = req.params;
  const { subtasks } = req.body;

  try {
    const task = await updateTask.execute({
      boardId,
      taskId,
      subtasks,
    });
    res.status(200).json(taskApiResponseMapper.fromDomain(task));
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else if (error instanceof ColumnErrors.NotFound) {
      res.status(404).json({ message: "Column Not Found" });
    } else if (error instanceof SubtaskErrors.NotFound) {
      res.status(404).json({ message: "Subtask Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export { boardRouter };
