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
import { boardRouter } from "../routes/boardRouter";
import prisma from "../../client";
import { Board } from "../../core/entities/Board";
import { Column } from "../../core/entities/Column";
import { Task } from "../../core/entities/Task";
import { Subtask } from "../../core/entities/Subtask";

const app = express();

describe("API endpoints - /boards", function () {
  let boardSamples: Board[] = [];
  let boardRepository: PrismaBoardRepository;
  let taskSamples: Task[] = [];

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new PrismaBoardRepository();

    for (let i = 0; i < 5; i++) {
      const boardId = idGateway.generate();
      const board = Board.create({
        id: boardId,
        name: `Test Board ${i}`,
        columns: [
          Column.create({ boardId, name: "Todo" }),
          Column.create({ boardId, name: "Doing" }),
        ],
      });
      boardSamples.push(board);
    }

    for (let i = 0; i < 5; i++) {
      const task = Task.create({
        id: idGateway.generate(),
        title: `Test Task ${i}`,
        description: "Test Description",
        boardId: boardSamples[0].props.id,
        status: boardSamples[0].props.columns[0].props.name,
        subtasks: [
          Subtask.create({ id: idGateway.generate(), title: "Todo 1" }),
          Subtask.create({ id: idGateway.generate(), title: "Todo 2" }),
        ],
      });
      taskSamples.push(task);
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

  it("POST /boards - should create a board", async () => {
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

  it("GET /boards - should list all boards", async () => {
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

  it("GET /boards/:boardId - should find a board by id", async () => {
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

  it("DELETE /boards/:boardId - should delete a board", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    await request(app).delete(`/boards/${board.props.id}`).expect(204);
    await request(app).get(`/boards/${board.props.id}`).expect(404);
  });

  it("POST /boards/:boardId/tasks - should create a task", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    await request(app)
      .post(`/boards/${board.props.id}/tasks`)
      .send({
        title: "Testing Task",
        description: "For the endpoint test",
        status: "Doing",
        subtasks: ["Success test", "Fail tests"],
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body.title).toEqual("Testing Task");
        expect(res.body.description).toEqual("For the endpoint test");
        expect(res.body.status).toEqual("Doing");
        expect(res.body.subtasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ title: "Success test" }),
            expect.objectContaining({ title: "Fail tests" }),
          ])
        );
      })
      .expect(201);
  });

});
