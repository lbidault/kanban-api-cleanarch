import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import { PrismaBoardRepository } from "../../adapters/db/repositories/PrismaBoardRepository";
import { PrismaTaskRepository } from "../../adapters/db/repositories/PrismaTaskRepository";
import { V4IdGateway } from "../../adapters/gateways/V4IdGateway";
import request from "supertest";
import express from "express";
import { taskRouter } from "../routes/taskRouter";
import prisma from "../../client";
import { Board } from "../../core/entities/Board";
import { Column } from "../../core/entities/Column";
import { Task } from "../../core/entities/Task";
import { Subtask } from "../../core/entities/Subtask";

const app = express();

describe("API endpoints - /tasks", function () {
  let boardSamples: Board[] = [];
  let boardRepository: PrismaBoardRepository;
  let taskSamples: Task[] = [];
  let taskRepository: PrismaTaskRepository;

  beforeAll(async () => {
    const idGateway = new V4IdGateway();
    boardRepository = new PrismaBoardRepository();
    taskRepository = new PrismaTaskRepository();

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
    app.use("/tasks", taskRouter);

    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.board.deleteMany();
  });

  it("GET /tasks/:taskId - should return a task", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    const task = taskSamples[0];
    await taskRepository.create(task);

    await request(app)
      .get(`/tasks/${task.props.id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: task.props.id,
            title: task.props.title,
            description: task.props.description,
            status: task.props.status,
            subtasks: [
              expect.objectContaining({ title: "Todo 1" }),
              expect.objectContaining({ title: "Todo 2" }),
            ],
          })
        );
      })
      .expect(200);
  });

  it("DELETE /tasks/:taskId - should delete a task", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    const task = taskSamples[0];
    await taskRepository.create(task);

    await request(app).delete(`/tasks/${task.props.id}`).expect(204);
    await request(app).get(`/tasks/${task.props.id}`).expect(404);
  });

  it("PATCH /tasks/:taskId/subtasks/:subtaskId - should update task's subtasks", async () => {
    const board = boardSamples[0];
    await boardRepository.create(board);
    const task = taskSamples[0];
    await taskRepository.create(task);

    await request(app)
      .patch(
        `/tasks/${task.props.id}/subtasks/${task.props.subtasks[0].props.id}`
      )
      .send({})
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body.subtasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ isCompleted: true }),
            expect.objectContaining({ isCompleted: false }),
          ])
        );
      })
      .expect(200);

    await request(app)
      .patch(
        `/tasks/${task.props.id}/subtasks/${task.props.subtasks[0].props.id}`
      )
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect((res) => {
        expect(res.body.subtasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ isCompleted: false }),
            expect.objectContaining({ isCompleted: false }),
          ])
        );
      })
      .expect(200);
  });
});
