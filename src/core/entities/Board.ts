import { Column } from "./Column";
import { ColumnErrors } from "../errors/ColumnErrors";
import { TaskErrors } from "../errors/TaskErrors";

export type BoardProperties = {
  id: string;
  name: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
};

export class Board {
  props: BoardProperties;

  constructor(props: BoardProperties) {
    this.props = props;
  }

  static create(props: {
    id: string;
    name: string;
    columns: Column[];
  }) {
    return new Board({
      id: props.id,
      name: props.name,
      columns: props.columns,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(props: { name?: string }) {
    if (props.name) {
      this.props.name = props.name;
    }
    this.props.updatedAt = new Date();
  }

  addColumn(column: Column) {
    this.props.columns.push(column);
    this.props.updatedAt = new Date();
  }

  removeColumn(columnId: string) {
    this.props.columns = this.props.columns.filter(
      (column) => column.props.id !== columnId
    );
    this.props.updatedAt = new Date();
  }

  moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {
    const sourceColumn = this.props.columns.find(c => c.props.id === sourceColumnId);
    const targetColumn = this.props.columns.find(c => c.props.id === targetColumnId);
  
    if (!sourceColumn || !targetColumn) {
      throw new ColumnErrors.NotFound();
    }
  
    const taskIndex = sourceColumn.props.tasks.findIndex(t => t.props.id === taskId);
    if (taskIndex === -1) {
      throw new TaskErrors.NotFound();
    }
  
    const [task] = sourceColumn.props.tasks.splice(taskIndex, 1);
    targetColumn.props.tasks.push(task);
  
    this.props.updatedAt = new Date();
  }
  

}
