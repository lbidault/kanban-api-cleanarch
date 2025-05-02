import { Router } from "express";
import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { CreateBoard, CreateBoardInput } from "../../core/usecases/CreateBoard";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import {
  BoardApiResponseMapper,
  BoardApiShortResponseMapper,
} from "../dtos/BoardApiResponse";
import { GetBoardList } from "../../core/usecases/GetBoardList";
import { GetBoard } from "../../core/usecases/GetBoard";
import { DeleteBoard } from "../../core/usecases/DeleteBoard";
import { BoardErrors } from "../../core/errors/BoardErrors";

const boardRouter = Router();
const boardRepository = new PrismaBoardRepository();
const boardApiResponseMapper = new BoardApiResponseMapper();
const boardApiShortResponseMapper = new BoardApiShortResponseMapper();
const idGateway = new V4IdGateway();

const createBoard = new CreateBoard(boardRepository, idGateway);
const getBoardList = new GetBoardList(boardRepository);
const getBoard = new GetBoard(boardRepository);
const deleteBoard = new DeleteBoard(boardRepository);

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

boardRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const board = await getBoard.execute({ id });
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

boardRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await deleteBoard.execute({ id });
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

export { boardRouter };
