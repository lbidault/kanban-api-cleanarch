import express from "express";

import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { CreateBoard, CreateBoardInput } from "../../core/usecases/CreateBoard";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import { BoardApiResponseMapper, BoardApiShortResponseMapper } from "../dtos/BoardApiResponse";

const boardRouter = express.Router();
const boardRepository = new PrismaBoardRepository();
const boardApiResponseMapper = new BoardApiResponseMapper();
const boardApiShortResponseMapper = new BoardApiShortResponseMapper();
const idGateway = new V4IdGateway();

const createBoard = new CreateBoard(boardRepository, idGateway);

boardRouter.post("/", async (req, res) => {
  const { name, columns }: CreateBoardInput = req.body;

  try {
    const board = await createBoard.execute({ name, columns });
    res.status(201).json(boardApiShortResponseMapper.fromDomain(board));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export { boardRouter };
