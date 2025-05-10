import { Task } from "./Task";

export type ColumnProperties = {
  boardId: string;
  name: string;
  tasks: Task[];
};

export class Column {
  props: ColumnProperties;

  constructor(props: ColumnProperties) {
    this.props = props;
  }

  static create(props: { boardId: string; name: string }) {
    return new Column({
      boardId: props.boardId,
      name: props.name,
      tasks: [],
    });
  }

  update(props: { name?: string }) {
    if (props.name) this.props.name = props.name;
  }

  addTask(task: Task) {
    this.props.tasks.push(task);
  }

  removeTask(taskboardId: string) {
    this.props.tasks = this.props.tasks.filter(
      (task) => task.props.boardId !== taskboardId
    );
  }
}
