import { Board } from "../../core/entities/Board";
import { Mapper } from "../../core/Mapper";

export type BoardApiResponse = {
  id: string;
  name: string;
  columns: {
    name: string;
    tasks: {
      id: string;
      status: string;
      title: string;
      description: string;
      subtasks: {
        id: string;
        title: string;
        isCompleted: boolean;
      }[];
    }[];
  }[];
};

export type BoardApiShortResponse = {
  id: string;
  name: string;
  columns: {
    name: string;
  }[];
};

export class BoardApiResponseMapper implements Mapper<BoardApiResponse, Board> {
  fromDomain(board: Board): BoardApiResponse {
    return {
      id: board.props.id,
      name: board.props.name,
      columns: board.props.columns.map((column) => ({
        name: column.props.name,
        tasks: column.props.tasks.map((task) => ({
          id: task.props.id,
          status: task.props.status,
          title: task.props.title,
          description: task.props.description,
          subtasks: task.props.subtasks.map((subtask) => ({
            id: subtask.props.id,
            title: subtask.props.title,
            isCompleted: subtask.props.isCompleted,
          })),
        })),
      })),
    };
  }
}

export class BoardApiShortResponseMapper
  implements Mapper<BoardApiShortResponse, Board>
{
  fromDomain(board: Board): BoardApiShortResponse {
    return {
      id: board.props.id,
      name: board.props.name,
      columns: board.props.columns.map((column) => ({
        name: column.props.name,
      })),
    };
  }
}
