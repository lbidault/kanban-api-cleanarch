import { GetBoard } from "../usecases/GetBoard";
import { Board } from "../entities/Board";
import { InMemoryBoardRepository } from "./adapters/repositories/InMemoryBoardRepository";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { BoardErrors } from "../errors/BoardErrors";
import { Column } from "../entities/Column";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

const boardDb = new Map<string, Board>();

describe("Unit - Get Board", () => {
  let board: Board;
  let getBoard: GetBoard;
  let boardRepository: InMemoryBoardRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    getBoard = new GetBoard(boardRepository);

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

  beforeEach(async () => {
    await boardRepository.create(board);
  });

  it("should Get a board", async () => {
    const input = {
      id: board.props.id,
    };

    const existingBoard = await getBoard.execute(input);
    expect(existingBoard).toBeInstanceOf(Board);
    expect(existingBoard.props.id).toBe(board.props.id);
    expect(existingBoard.props.name).toBe(board.props.name);
  });

  it("should fail to Get a board that does not exist", async () => {
    const input = {
      id: "non-existing-id",
    };

    const fail = () => getBoard.execute(input);
    await expect(() => fail()).rejects.toThrow(BoardErrors.NotFound);
  });
});
