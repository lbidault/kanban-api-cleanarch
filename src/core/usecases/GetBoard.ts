import { UseCase } from "./UseCase";
import { BoardRepository } from "../repositories/BoardRepository";
import { BoardErrors } from "../errors/BoardErrors";
import { Board } from "../entities/Board";

export interface GetBoardInput {
  id: string;
}

export class GetBoard implements UseCase<GetBoardInput, Board> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(input: GetBoardInput): Promise<Board> {
    const { id } = input;
    const existingBoard = await this.boardRepository.findById(id);

    if (!existingBoard) {
      throw new BoardErrors.NotFound();
    }

    return existingBoard;
  }
}
