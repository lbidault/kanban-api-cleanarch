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
        id: column.props.id,
        boardId: board.props.id,
        name: column.props.name,
        tasks: column.props.tasks.map((task) => ({
          id: task.props.id,
          columnId: column.props.id,
          title: task.props.title,
          description: task.props.description,
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

  toDomain(boardModel: BoardModel): Board {
    return new Board({
      id: boardModel.id,
      name: boardModel.name,
      createdAt: boardModel.createdAt,
      updatedAt: boardModel.updatedAt,
      columns: boardModel.columns.map((columnModel: ColumnModel) => 
        new Column({
          id: columnModel.id,
          name: columnModel.name,
          tasks: columnModel.tasks.map((taskModel: TaskModel) => 
            new Task({
              id: taskModel.id,
              title: taskModel.title,
              description: taskModel.description,
              status: columnModel.name,
              subtasks: taskModel.subtasks.map((subtaskModel: SubtaskModel) => 
                new Subtask({
                  id: subtaskModel.id,
                  title: subtaskModel.title,
                  isCompleted: subtaskModel.isCompleted,
                })
              ),
            })
          )
        })
      ),
    });
  }
}
