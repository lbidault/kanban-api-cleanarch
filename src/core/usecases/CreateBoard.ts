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
      throw new BoardErrors.InvalidNameError();
    }

    const existingBoard = await this.boardRepository.findByName(name);
    if (existingBoard) {
      throw new BoardErrors.NameAlreadyExists();
    }


    const board = Board.create({
      id: this.idGateway.generate(),
      name,
      columns: columns.map((columnName) =>
        Column.create({ id: this.idGateway.generate(), name: columnName })
      ),
    });

    await this.boardRepository.create(board);

    return board;
  }
}
