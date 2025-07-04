import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { boardRouter } from "./app/routes/boardRouter";
import { taskRouter } from "./app/routes/taskRouter";
import cors from "cors";
import { setupSwagger } from "./swagger";

const app = express();
setupSwagger(app);

app.use(cors({ origin: process.env.FRONT_ORIGIN }));
app.use(express.json());
app.use("/boards", boardRouter);
app.use("/tasks", taskRouter);
app.get("/ping", (_, res) => {
  res.status(200).send("pong");
});


if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
  });
}
