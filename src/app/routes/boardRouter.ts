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
import { EditBoard } from "../../core/usecases/EditBoard";
import { DeleteBoard } from "../../core/usecases/DeleteBoard";
import { BoardErrors } from "../../core/errors/BoardErrors";
import { ColumnErrors } from "../../core/errors/ColumnErrors";
import { TaskErrors } from "../../core/errors/TaskErrors";
import { UpdateTaskStatus } from "../../core/usecases/UpdateTaskStatus";

const boardRouter = Router();
const boardRepository = new PrismaBoardRepository();
const taskRepository = new PrismaTaskRepository();
const boardApiResponseMapper = new BoardApiResponseMapper();
const taskApiResponseMapper = new TaskApiResponseMapper();
const idGateway = new V4IdGateway();

const createBoard = new CreateBoard(boardRepository, idGateway);
const getBoardList = new GetBoardList(boardRepository);
const getBoard = new GetBoard(boardRepository);
const editBoard = new EditBoard(boardRepository);
const deleteBoard = new DeleteBoard(boardRepository);
const createTask = new CreateTask(boardRepository, taskRepository, idGateway);
const updateTaskStatus = new UpdateTaskStatus(boardRepository, taskRepository);

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - columns
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Project Board"
 *               columns:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Todo", "Doing", "Done"]
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       400:
 *         description: Duplicate Column Name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Duplicate Column Name
 *       401:
 *         description: Invalid Name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Name
 *       409:
 *         description: Name Already Exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Name Already Exists
 *       500:
 *         description: Internal Server Error
 */
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
    } else if (error instanceof BoardErrors.DuplicateColumnName) {
      res.status(400).json({ message: "Duplicate Column Name" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get all boards
 *     responses:
 *       200:
 *         description: List of boards
 *       500:
 *         description: Internal Server Error
 */
boardRouter.get("/", async (req, res) => {
  try {
    const boards = await getBoardList.execute();
    res.status(200).json(boards.map(boardApiResponseMapper.fromDomain));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /boards/{boardId}:
 *   get:
 *     summary: Get a board by ID
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board found
 *       404:
 *         description: Board Not Found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /boards/{boardId}:
 *   put:
 *     summary: Update a board's name and its columns
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         description: ID of the board to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - columns
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Board Name"
 *               columns:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                   properties:
 *                     id:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Todo"
 *                     name:
 *                       type: string
 *                       example: "Updated Column Name"
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "board-123"
 *                 name:
 *                   type: string
 *                   example: "Updated Board"
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "In Progress"
 *       400:
 *         description: Invalid input (e.g. name too short, column errors, duplicates)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Duplicate Column Name"
 *       404:
 *         description: Board not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Board Not Found"
 *       409:
 *         description: Board name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Board Name Already Exists"
 *       500:
 *         description: Internal Server Error
 */
boardRouter.put("/:boardId", async (req, res) => {
  const { boardId } = req.params;
  const { name, columns } = req.body;

  try {
    const board = await editBoard.execute({ id: boardId, name, columns });
    res.status(200).json(boardApiResponseMapper.fromDomain(board));
  } catch (error) {
    if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else if (error instanceof BoardErrors.NameAlreadyExists) {
      res.status(409).json({ message: "Board Name Already Exists" });
    } else if (error instanceof BoardErrors.InvalidName) {
      res.status(400).json({ message: "Board Invalide Name" });
    } else if (error instanceof BoardErrors.DuplicateColumnName) {
      res.status(400).json({ message: "Duplicate Column Name" });
    } else if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else if (error instanceof ColumnErrors.InvalidName) {
      res.status(400).json({ message: "Column Invalid Name" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

/**
 * @swagger
 * /boards/{boardId}:
 *   delete:
 *     summary: Delete a board by ID
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Board deleted
 *       404:
 *         description: Board Not Found
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /boards/{boardId}/tasks:
 *   post:
 *     summary: Create a task in a board
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               subtasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     isCompleted:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Invalid Name
 *       404:
 *         description: Board or column not found
 *       409:
 *         description: Title Already Exists
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /boards/{boardId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task's status (move to another column)
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task status updated
 *       404:
 *         description: Board, Task or Column Not Found
 *       500:
 *         description: Internal Server Error
 */
boardRouter.patch("/:boardId/tasks/:taskId", async (req, res) => {
  const { boardId, taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await updateTaskStatus.execute({ boardId, taskId, status });
    res.status(200).json(taskApiResponseMapper.fromDomain(task));
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else if (error instanceof BoardErrors.NotFound) {
      res.status(404).json({ message: "Board Not Found" });
    } else if (error instanceof ColumnErrors.NotFound) {
      res.status(404).json({ message: "Column Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export { boardRouter };
