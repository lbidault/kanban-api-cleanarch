import { UseCase } from "./UseCase";
import { BoardRepository } from "../repositories/BoardRepository";
import { BoardErrors } from "../errors/BoardErrors";

export interface DeleteBoardInput {
  id: string;
}

export class DeleteBoard implements UseCase<DeleteBoardInput, void> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(input: DeleteBoardInput): Promise<void> {
    const { id } = input;
    const existingBoard = await this.boardRepository.findById(id);

    if (!existingBoard) {
      throw new BoardErrors.NotFound();
    }

    await this.boardRepository.delete(existingBoard.props.id);
  }
}
