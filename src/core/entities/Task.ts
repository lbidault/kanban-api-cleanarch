import { Subtask } from "./Subtask";

export type TaskProperties = {
  id: string;
  title: string;
  description: string;
  status: string;
  subtasks: Subtask[];
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
  }) {
    return new Task({
      id: props.id,
      title: props.title,
      description: props.description,
      status: props.status,
      subtasks: props.subtasks,
    });
  }

  update(props: { title?: string; description?: string }) {
    if (props.title) {
      this.props.title = props.title;
    }
    if (props.description) {
      this.props.description = props.description;
    }
  }

  addSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }

  removeSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }
}
