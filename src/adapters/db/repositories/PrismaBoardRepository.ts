import { BoardRepository } from "../../../core/repositories/BoardRepository";
import { Board } from "../../../core/entities/Board";
import prisma from "../../../client";
import { PrismaBoardMapper } from "../mappers/PrismaBoardMapper";
import { BoardModel } from "../models/Board";
import { BoardErrors } from "../../../core/errors/BoardErrors";

const boardMapper = new PrismaBoardMapper();

export class PrismaBoardRepository implements BoardRepository {
  async create(board: Board): Promise<Board> {
    const boardModel: BoardModel = boardMapper.fromDomain(board);

    const createdBoardModel = await prisma.board.create({
      data: {
        id: boardModel.id,
        name: boardModel.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        columns: {
          create: boardModel.columns.map((column) => ({
            name: column.name,
          })),
        },
      },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });

    const createdBoard = boardMapper.toDomain(createdBoardModel);
    return createdBoard;
  }

  async findById(id: string): Promise<Board | null> {
    const boardModel = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });

    if (!boardModel) {
      return null;
    }

    const board = boardMapper.toDomain(boardModel);
    return board;
  }

  async findByName(name: string): Promise<Board | null> {
    const boardModel = await prisma.board.findUnique({
      where: { name },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });

    if (!boardModel) {
      return null;
    }

    const board = boardMapper.toDomain(boardModel);
    return board;
  }

  async findAll(): Promise<any[]> {
    const boards = await prisma.board.findMany({
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });

    return boards.map((boardModel) => boardMapper.toDomain(boardModel));
  }

  async update(board: Board): Promise<Board> {
    const boardModel: BoardModel = boardMapper.fromDomain(board);

    await prisma.column.deleteMany({
      where: {
        boardId: boardModel.id,
        name: {
          notIn: boardModel.columns.map((c) => c.name),
        },
      },
    });

    for (const column of boardModel.columns) {
      await prisma.column.upsert({
        where: { boardId_name: { boardId: column.boardId, name: column.name } },
        update: { name: column.name },
        create: {
          name: column.name,
          boardId: column.boardId,
        },
      });
    }

    for (const column of boardModel.columns) {
      if (column.tasks) {
        for (const task of column.tasks) {
          await prisma.task.update({
            where: { id: task.id },
            data: { status: column.name },
          });
        }
      }
    }

    const updatedBoardModel = await prisma.board.findUnique({
      where: { id: boardModel.id },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });

    if (!updatedBoardModel) {
      throw new BoardErrors.NotFound();
    }

    return boardMapper.toDomain(updatedBoardModel);
  }

  async delete(id: string): Promise<void> {
    const board = await prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      throw new BoardErrors.NotFound();
    }

    await prisma.board.delete({
      where: { id },
    });
  }
}
