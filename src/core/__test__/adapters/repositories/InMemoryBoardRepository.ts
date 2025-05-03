import { BoardRepository } from "../../../repositories/BoardRepository";
import { Board } from "../../../entities/Board";

export class InMemoryBoardRepository implements BoardRepository {
  constructor(private readonly db: Map<string, Board>) {}
  async create(board: Board): Promise<Board> {
    this.db.set(board.props.id, board);
    return Promise.resolve(board);
  }
  async findById(id: string): Promise<Board | null> {
    const board = this.db.get(id) ?? null;
    return Promise.resolve(board);
  }
  async findByName(name: string): Promise<Board | null> {
    const board = Array.from(this.db.values()).find(
      (board) => board.props.name == name
    );
    return Promise.resolve(board ?? null);
  }
  async findAll(): Promise<Board[]> {
    const boards = Array.from(this.db.values());
    return Promise.resolve(boards);
  }
  async update(board: Board): Promise<Board> {
    this.db.set(board.props.id, board);
    return Promise.resolve(board);
  }
  async delete(id: string): Promise<void> {
    this.db.delete(id);
    return;
  }
}
