import { CreateBoard } from "../usecases/CreateBoard";
import { Board } from "../entities/Board";
import { InMemoryBoardRepository } from "./adapters/repositories/InMemoryBoardRepository";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { BoardErrors } from "../errors/BoardErrors";
import { Column } from "../entities/Column";
import { afterEach, beforeAll, describe, expect, it } from "@jest/globals";

const boardDb = new Map<string, Board>();

describe("Unit - Create Board", () => {
  let board: Board;
  let createBoard: CreateBoard;
  let boardRepository: InMemoryBoardRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    createBoard = new CreateBoard(boardRepository, idGateway);

    board = Board.create({
      id: idGateway.generate(),
      name: "Test Board",
      columns: [
        Column.create({ id: idGateway.generate(), name: "Column 1" }),
        Column.create({ id: idGateway.generate(), name: "Column 2" }),
      ],
    });
  });

  afterEach(() => {
    boardDb.clear();
  });

  it("should create a board", async () => {
    const input = {
      name: board.props.name,
      columns: board.props.columns.map((column) => column.props.name),
    };

    const output = await createBoard.execute(input);

    expect(output).toBeDefined();
    expect(output.props.name).toBe(input.name);
    expect(output.props.columns.length).toBe(input.columns.length);
    output.props.columns.forEach((column, index) => {
      expect(column.props.name).toBe(input.columns[index]);
    });

    const result = await boardRepository.findById(output.props.id);
    expect(result).toEqual(output);
  });

  it("should fail to create a board with the same name", async () => {
    const input = {
      name: board.props.name,
      columns: [],
    };

    await boardRepository.create(board);

    const fail = () => createBoard.execute(input);
    await expect(() => fail()).rejects.toThrow(BoardErrors.NameAlreadyExists);
  });

  it("should fail to create a board with an invalid name", async () => {
    const input = {
      name: "ab",
      columns: [],
    };

    const fail = () => createBoard.execute(input);
    await expect(() => fail()).rejects.toThrow(BoardErrors.InvalidNameError);
  });
});
