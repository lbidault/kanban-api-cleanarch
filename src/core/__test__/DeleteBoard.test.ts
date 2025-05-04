import { DeleteBoard } from "../usecases/DeleteBoard";
import { Board } from "../entities/Board";
import { InMemoryBoardRepository } from "./adapters/repositories/InMemoryBoardRepository";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { BoardErrors } from "../errors/BoardErrors";
import { Column } from "../entities/Column";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

const boardDb = new Map<string, Board>();

describe("Unit - Delete Board", () => {
  let board: Board;
  let deleteBoard: DeleteBoard;
  let boardRepository: InMemoryBoardRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    deleteBoard = new DeleteBoard(boardRepository);

    const boardId = idGateway.generate();
    board = Board.create({
      id: boardId,
      name: "Test Board",
      columns: [
        Column.create({ boardId, name: "Column 1" }),
        Column.create({ boardId, name: "Column 2" }),
      ],
    });
  });

  afterEach(() => {
    boardDb.clear();
  });

  beforeEach(async () => {
    await boardRepository.create(board);
  });

  it("should delete a board", async () => {
    const input = {
      id: board.props.id,
    };

    const stillExisting = await boardRepository.findById(board.props.id);
    expect(stillExisting).toBeInstanceOf(Board);
    await deleteBoard.execute(input);
    const notExisting = await boardRepository.findById(board.props.id);
    expect(notExisting).toBeNull();
  });

  it("should fail to delete a board that does not exist", async () => {
    const input = {
      id: "non-existing-id",
    };

    const fail = () => deleteBoard.execute(input);
    await expect(() => fail()).rejects.toThrow(BoardErrors.NotFound);
  });

});
