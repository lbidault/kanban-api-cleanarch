import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { CreateBoard, CreateBoardInput } from "../../core/usecases/CreateBoard";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import { BoardApiResponseMapper } from "../dtos/BoardApiResponse";
import request from "supertest";
import express from "express";
import { boardRouter } from "../routes/board";
import prisma from "../../client";

const app = express();

describe("API endpoints - /boards", function () {
  beforeAll(async () => {
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

  it("responds with json", async () => {
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
});
