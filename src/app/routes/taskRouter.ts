import { Router } from "express";
import { PrismaTaskRepository } from "../../adapters/db/repositories/PrismaTaskRepository";
import { TaskApiResponseMapper } from "../dtos/TaskApiResponse";
import { TaskErrors } from "../../core/errors/TaskErrors";
import { GetTask } from "../../core/usecases/GetTask";
import { DeleteTask } from "../../core/usecases/DeleteTask";
import { UpdateSubtask } from "../../core/usecases/UpdateSubtask";
import { SubtaskErrors } from "../../core/errors/SubtaskErrors";

const taskRouter = Router();
const taskRepository = new PrismaTaskRepository();
const taskApiResponseMapper = new TaskApiResponseMapper();

const getTask = new GetTask(taskRepository);
const deleteTask = new DeleteTask(taskRepository);
const updateSubtask = new UpdateSubtask(taskRepository);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task Not Found
 *       500:
 *         description: Internal Server Error
 */
taskRouter.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await getTask.execute({ id: taskId });
    res.status(200).json(taskApiResponseMapper.fromDomain(task));
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task Not Found
 *       500:
 *         description: Internal Server Error
 */
taskRouter.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  try {
    await deleteTask.execute({ id: taskId });
    res.status(204).json();
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

/**
 * @swagger
 * /tasks/{taskId}/subtasks/{subtaskId}:
 *   patch:
 *     summary: Toggle a subtask's completion state
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated with toggled subtask
 *       404:
 *         description: Task or Subtask Not Found
 *       500:
 *         description: Internal Server Error
 */
taskRouter.patch("/:taskId/subtasks/:subtaskId", async (req, res) => {
  const { taskId, subtaskId } = req.params;

  try {
    const task = await updateSubtask.execute({
      taskId,
      subtaskId,
    });
    res.status(200).json(taskApiResponseMapper.fromDomain(task));
  } catch (error) {
    if (error instanceof TaskErrors.NotFound) {
      res.status(404).json({ message: "Task Not Found" });
    } else if (error instanceof SubtaskErrors.NotFound) {
      res.status(404).json({ message: "Subtask Not Found" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export { taskRouter };
