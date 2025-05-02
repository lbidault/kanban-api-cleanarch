import { Task } from "./Task";

export type ColumnProperties = {
  id: string;
  name: string;
  tasks: Task[];
};

export class Column {
  props: ColumnProperties;

  constructor(props: ColumnProperties) {
    this.props = props;
  }

  static create(props: { id: string; name: string }) {
    return new Column({
      id: props.id,
      name: props.name,
      tasks: [],
    });
  }

  update(name: string) {
    this.props.name = name;
  }

  addTask(task: Task) {
    this.props.tasks.push(task);
  }

  removeTask(taskId: string) {
    this.props.tasks = this.props.tasks.filter(
      (task) => task.props.id !== taskId
    );
  }
}
