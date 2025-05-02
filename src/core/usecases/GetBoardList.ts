import { UseCase } from "./UseCase";
import { Board } from "../entities/Board";
import { BoardRepository } from "../repositories/BoardRepository";


export class GetBoardList implements UseCase<void, Board[]> {
  constructor(
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(): Promise<Board[]> {
    // const { name, columns } = input;
    const boards = await this.boardRepository.findAll();

    return boards;
  }
}
