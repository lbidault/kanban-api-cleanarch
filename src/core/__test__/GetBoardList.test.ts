import { GetBoardList } from "../usecases/GetBoardList";
import { Board } from "../entities/Board";
import { InMemoryBoardRepository } from "./adapters/repositories/InMemoryBoardRepository";
import { V4IdGateway } from "./adapters/gateways/V4IdGateway";
import { Column } from "../entities/Column";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

const boardDb = new Map<string, Board>();

describe("Unit - Get Board List", () => {
  let boards: Board[] = [];
  let getBoardList: GetBoardList;
  let boardRepository: InMemoryBoardRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new InMemoryBoardRepository(boardDb);
    getBoardList = new GetBoardList(boardRepository);

    for (let i = 0; i < 5; i++) {
      const boardId = idGateway.generate();
      const board = Board.create({
        id: boardId,
        name: "Test Board",
        columns: [
          Column.create({ boardId, name: "Column 1" }),
          Column.create({ boardId, name: "Column 2" }),
        ],
      });
      boards.push(board);
      await boardRepository.create(board);
    }
  });

  afterAll(() => {
    boardDb.clear();
  });

  it("should find all boards", async () => {
    const output = await getBoardList.execute();

    expect(output.length).toEqual(boards.length);
    for (let i = 0; i < output.length; i++) {
      expect(output[i]).toEqual(boards[i]);
    }
  });
});
