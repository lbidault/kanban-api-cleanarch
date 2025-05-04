import { DomainErrors } from "./DomainErrors";

export namespace TaskErrors {
  export class TitleAlreadyExists extends DomainErrors {
    constructor() {
      super("TASK_TITLE_ALREADY_EXISTS");
    }
  }

  export class NotFound extends DomainErrors {
    constructor() {
      super("TASK_NOT_FOUND");
    }
  }
  
  export class InvalidName extends DomainErrors {
    constructor() {
      super("TASK_INVALID_NAME");
    }
  }
  
  export class PersistenceFailed extends DomainErrors {
    constructor() {
      super("TASK_PERSISTENCE_FAILED");
    }
  }
  
}