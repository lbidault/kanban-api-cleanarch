export type SubtaskProperties = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export class Subtask {
  props: SubtaskProperties;

  constructor(props: SubtaskProperties) {
    this.props = props;
  }

  static create(props: {
    id: string;
    title: string;
  }) {
    return new Subtask({
      id: props.id,
      title: props.title,
      isCompleted: false,
    });
  }

  toggle() {
    this.props.isCompleted = !this.props.isCompleted;
  }
}
