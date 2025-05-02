import { DomainErrors } from "./DomainErrors";

export namespace ColumnErrors {
  export class NameAlreadyExists extends DomainErrors {
    constructor() {
      super("COLUMN_NAME_ALREADY_EXISTS");
    }
  }

  export class NotFound extends DomainErrors {
    constructor() {
      super("COLUMN_NOT_FOUND");
    }
  }

  export class InvalidNameError extends DomainErrors {
    constructor() {
      super("COLUMN_INVALID_NAME");
    }
  }
}