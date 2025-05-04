import { PrismaBoardRepository } from "../db/repositories/PrismaBoardRepository";
import { Board } from "../../core/entities/Board";
import { Column } from "../../core/entities/Column";
import { V4IdGateway } from "../gateways/V4IdGateway";
import prisma from "../../client";
import {
  afterEach,
  beforeAll,
  afterAll,
  describe,
  expect,
  it,
} from "@jest/globals";

describe("Integration - Prisma Board Repository", function () {
  let boardRepository: PrismaBoardRepository;
  let board: Board;
  beforeAll(async () => {
    await prisma.$connect();
    const idGateway = new V4IdGateway();
    boardRepository = new PrismaBoardRepository();

    const boardId = idGateway.generate();
    board = Board.create({
      id: boardId,
      name: "Test Board",
      columns: [
        Column.create({ boardId, name: "Column 1" }),
        Column.create({ boardId, name: "Column 2" }),
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.board.deleteMany();
  });

  it("should create a board", async () => {
    await boardRepository.create(board);

    const savedBoard = await prisma.board.findUnique({
      where: { id: board.props.id },
      include: { columns: true },
    });

    expect(savedBoard).not.toBeNull();
    expect(savedBoard!.name).toBe(board.props.name);
    expect(savedBoard!.columns.length).toBe(2);

    const columnNames = savedBoard!.columns.map((c) => c.name).sort();
    const originalNames = board.props.columns.map((c) => c.props.name).sort();
    expect(columnNames).toEqual(originalNames);
  });

  it("should find a board by id", async () => {
    await prisma.board.create({
      data: {
        id: board.props.id,
        name: board.props.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const savedBoard = await boardRepository.findById(board.props.id);

    expect(savedBoard).not.toBeNull();
    expect(savedBoard!.props.name).toBe(board.props.name);
  });

  it("should find all boards", async () => {
    await prisma.board.create({
      data: {
        id: board.props.id,
        name: board.props.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const boards = await boardRepository.findAll();

    expect(boards.length).toBe(1);
    expect(boards[0].props.name).toBe(board.props.name);
  });

  it("should delete a board", async () => {
    await prisma.board.create({
      data: {
        id: board.props.id,
        name: board.props.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const savedBoard = await prisma.board.findUnique({
      where: { id: board.props.id },
      include: { columns: true },
    });

    expect(savedBoard).not.toBeNull();

    await boardRepository.delete(board.props.id);

    const deletedBoard = await prisma.board.findUnique({
      where: { id: board.props.id },
    });

    expect(deletedBoard).toBeNull();
  });
});
