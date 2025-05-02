import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import request from "supertest";
import express from "express";
import { boardRouter } from "../routes/board";
import prisma from "../../client";
import { Board } from "../../core/entities/Board";
import { Column } from "../../core/entities/Column";

const app = express();

describe("API endpoints - /boards", function () {
  let boardSamples: Board[] = [];
  let boardRepository: PrismaBoardRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new PrismaBoardRepository();

    for (let i = 0; i < 5; i++) {
      const board = Board.create({
        id: idGateway.generate(),
        name: `Test Board ${i}`,
        columns: [
          Column.create({ id: idGateway.generate(), name: "Column 1" }),
          Column.create({ id: idGateway.generate(), name: "Column 2" }),
        ],
      });
      boardSamples.push(board);
    }

    app.use(express.json());
    app.use("/boards", boardRouter);

    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.board.deleteMany();
  });

  it("should create a board", async () => {
    await request(app)
      .post("/boards")
      .send({ name: "Testing Board", columns: ["Todo", "Doing", "Done"] })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body.name).toEqual("Testing Board");
        expect(res.body.columns).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: "Todo" }),
            expect.objectContaining({ name: "Doing" }),
            expect.objectContaining({ name: "Done" }),
          ])
        );
      })
      .expect(201);
  });

  it("should list all boards", async () => {
    await Promise.all(
      boardSamples.map((board) => boardRepository.create(board))
    );
    const response = await request(app)
      .get("/boards")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    const boards = response.body;
    expect(boards.length).toEqual(5);
  });

  it("should find a board by id", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    const response = await request(app)
      .get(`/boards/${board.props.id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    const foundBoard = response.body;
    expect(foundBoard.name).toEqual(board.props.name);
    expect(foundBoard.columns.length).toEqual(board.props.columns.length);
    expect(foundBoard.columns[0].tasks).toBeInstanceOf(Array);
  });

  it("should delete a board", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    await request(app).delete(`/boards/${board.props.id}`).expect(204);
    await request(app)
      .get(`/boards/${board.props.id}`)
      .expect(404);
  });
});
