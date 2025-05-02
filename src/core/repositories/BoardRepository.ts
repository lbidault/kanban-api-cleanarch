import { Board } from "../entities/Board";

export interface BoardRepository {
  create(board: Board): Promise<Board>;
  findById(id: string): Promise<Board | null>;
  findByName(name: string): Promise<Board | null>;
  findAll(): Promise<any[]>;
  update(board: Board): Promise<Board>;
  delete(id: string): Promise<void>;
}

