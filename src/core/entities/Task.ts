import { Subtask } from "./Subtask";

export type TaskProperties = {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;

  boardId: string;
  status: string;
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
    subtasks: Subtask[];

    boardId: string;
    status: string;
  }) {
    return new Task({
      id: props.id,
      title: props.title,
      description: props.description,
      subtasks: props.subtasks,
      boardId: props.boardId,
      status: props.status,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    this.props.updatedAt = new Date();
  }

  addSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }

  removeSubtask(subtask: Subtask) {
    this.props.subtasks.push(subtask);
  }
}
