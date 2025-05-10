import { UseCase } from "./UseCase";
import { Board } from "../entities/Board";
import { BoardRepository } from "../repositories/BoardRepository";
import { BoardErrors } from "../errors/BoardErrors";
import { Column } from "../entities/Column";
import { ColumnErrors } from "../errors/ColumnErrors";

interface EditColumn {
  id?: { name: string };
  name: string;
}

export interface EditBoardInput {
  id: string;
  name: string;
  columns: EditColumn[];
}

export class EditBoard implements UseCase<EditBoardInput, Board> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(input: EditBoardInput): Promise<Board> {
    const { id, name, columns: inputColumns } = input;

    this.validateBoardName(name);
    this.validateColumnNames(inputColumns);
    this.checkDuplicateColumnNames(inputColumns);

    const board = await this.boardRepository.findById(id);
    if (!board) throw new BoardErrors.NotFound();

    const alreadyTaken = await this.boardRepository.findByName(name);
    if (alreadyTaken && alreadyTaken.props.id !== id) {
      throw new BoardErrors.NameAlreadyExists();
    }

    board.update({ name });

    this.applyColumnDeletions(board, inputColumns);
    this.applyColumnUpdates(board, inputColumns);
    this.applyColumnCreations(board, inputColumns, id);

    await this.boardRepository.update(board);
    return board;
  }

  private validateBoardName(name: string): void {
    if (name.length < 3) {
      throw new BoardErrors.InvalidName();
    }
  }

  private validateColumnNames(columns: EditColumn[]): void {
    const hasInvalid = columns.some((col) => col.name.length < 3);
    if (hasInvalid) {
      throw new ColumnErrors.InvalidName();
    }
  }

  private checkDuplicateColumnNames(columns: EditColumn[]): void {
    const names = columns.map((col) => col.name);
    const duplicates = names.filter((name, i, arr) => arr.indexOf(name) !== i);
    if (duplicates.length > 0) {
      throw new BoardErrors.DuplicateColumnName();
    }
  }

  private applyColumnDeletions(board: Board, inputColumns: EditColumn[]): void {
    const inputSet = new Set(
      inputColumns
        .map((col) => col.id?.name)
        .filter((name): name is string => typeof name === "string")
    );

    const toRemove = board.props.columns.filter(
      (col) => !inputSet.has(col.props.name)
    );

    toRemove.forEach((col) => board.removeColumn(col.props.name));
  }

  private applyColumnUpdates(board: Board, inputColumns: EditColumn[]): void {
    inputColumns.forEach((raw) => {
      const oldName = raw.id?.name;
      if (!oldName) return;

      const col = board.props.columns.find((col) => col.props.name === oldName);
      if (!col) return;

      col.update({ name: raw.name });
    });
  }

  private applyColumnCreations(
    board: Board,
    inputColumns: EditColumn[],
    boardId: string
  ): void {
    const newColumns = inputColumns.filter((col) => !col.id);

    newColumns.forEach((raw) => {
      const col = Column.create({ boardId, name: raw.name });
      board.addColumn(col);
    });
  }
}
