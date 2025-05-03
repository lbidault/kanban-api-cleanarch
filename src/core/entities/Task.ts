import { Subtask } from "./Subtask";

export type TaskProperties = {
  id: string;
  title: string;
  description: string;
  status: string;
  subtasks: Subtask[];

  columnId: string;
};

export class Task {
  props: TaskProperties;

  constructor(props: TaskProperties) {
    this.props = props;
  }

  static create(props: {
    id: string;
    title: string;
    description: string;
    status: string;
    subtasks: Subtask[];

    columnId: string;
  }) {
    return new Task({
      id: props.id,
      title: props.title,
      description: props.description,
      status: props.status,
      subtasks: props.subtasks,
      columnId: props.columnId,
    });
  }

  update(props: { title?: string; description?: string; status?: string }) {
    if (props.title) {
      this.props.title = props.title;
    }
    if (props.description) {
      this.props.description = props.description;
    }
    if (props.status) {
      this.props.status = props.status;
    }
  }

  addSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }

  removeSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }
}
