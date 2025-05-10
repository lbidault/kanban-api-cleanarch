import { UseCase } from "./UseCase";
import { Board } from "../entities/Board";
import { BoardRepository } from "../repositories/BoardRepository";
import { BoardErrors } from "../errors/BoardErrors";
import { IdGateway } from "../gateways/IdGateway";
import { Column } from "../entities/Column";

export interface CreateBoardInput {
  name: string;
  columns: string[];
}

export class CreateBoard implements UseCase<CreateBoardInput, Board> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly idGateway: IdGateway
  ) {}

  async execute(input: CreateBoardInput): Promise<Board> {
    const { name, columns } = input;

    if (name.length < 3) {
      throw new BoardErrors.InvalidName();
    }

    const existingBoard = await this.boardRepository.findByName(name);
    if (existingBoard) {
      throw new BoardErrors.NameAlreadyExists();
    }

    // Vérifie les doublons dans les noms de colonnes
    const uniqueNames = new Set(columns);
    if (uniqueNames.size !== columns.length) {
      throw new BoardErrors.DuplicateColumnName();
    }

    const boardId = this.idGateway.generate();
    const board = Board.create({
      id: boardId,
      name,
      columns: columns.map((columnName) =>
        Column.create({ boardId, name: columnName })
      ),
    });

    await this.boardRepository.create(board);

    return board;
  }
}