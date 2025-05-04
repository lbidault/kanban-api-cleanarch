import { BoardModel } from "../models/Board";
import { ColumnModel } from "../models/Column";
import { TaskModel } from "../models/Task";
import { SubtaskModel } from "../models/Subtask";
import { Board } from "../../../core/entities/Board";
import { Column } from "../../../core/entities/Column";
import { Task } from "../../../core/entities/Task";
import { Subtask } from "../../../core/entities/Subtask";
import { Mapper } from "../../../core/Mapper";

export class PrismaBoardMapper implements Mapper<BoardModel, Board> {
  fromDomain(board: Board): BoardModel {
    return {
      id: board.props.id,
      name: board.props.name,
      createdAt: board.props.createdAt,
      updatedAt: board.props.updatedAt,
      columns: board.props.columns.map((column) => ({
        boardId: board.props.id,
        name: column.props.name,
        tasks: column.props.tasks.map((task) => ({
          id: task.props.id,
          title: task.props.title,
          description: task.props.description,
          createdAt: task.props.createdAt,
          updatedAt: task.props.updatedAt,
          boardId: task.props.boardId,
          status: task.props.status,
          subtasks: task.props.subtasks.map((subtask) => ({
            id: subtask.props.id,
            taskId: task.props.id,
            title: subtask.props.title,
            isCompleted: subtask.props.isCompleted,
          })),
        })),
      })),
    };
  }

  toDomain(raw: BoardModel): Board {
    return new Board({
      id: raw.id,
      name: raw.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      columns: raw.columns.map(
        (columnModel: ColumnModel) =>
          new Column({
            boardId: columnModel.boardId,
            name: columnModel.name,
            tasks: columnModel.tasks.map(
              (taskModel: TaskModel) =>
                new Task({
                  id: taskModel.id,
                  title: taskModel.title,
                  description: taskModel.description,
                  createdAt: taskModel.createdAt,
                  updatedAt: taskModel.updatedAt,
                  boardId: taskModel.boardId,
                  status: taskModel.status,
                  subtasks: taskModel.subtasks.map(
                    (subtaskModel: SubtaskModel) =>
                      new Subtask({
                        id: subtaskModel.id,
                        title: subtaskModel.title,
                        isCompleted: subtaskModel.isCompleted,
                      })
                  ),
                })
            ),
          })
      ),
    });
  }
}
