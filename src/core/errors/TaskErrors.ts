import { DomainErrors } from "./DomainErrors";

export namespace TaskErrors {
  export class NameAlreadyExists extends DomainErrors {
    constructor() {
      super("TASK_NAME_ALREADY_EXISTS");
    }
  }

  export class NotFound extends DomainErrors {
    constructor() {
      super("TASK_NOT_FOUND");
    }
  }
}