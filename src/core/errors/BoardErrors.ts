import { DomainErrors } from "./DomainErrors";

export namespace BoardErrors {
  export class NameAlreadyExists extends DomainErrors {
    constructor() {
      super("BOARD_NAME_ALREADY_EXIST");
    }
  }

  export class NotFound extends DomainErrors {
    constructor() {
      super("BOARD_NOT_FOUND");
    }
  }

  export class InvalidName extends DomainErrors {
    constructor() {
      super("BOARD_INVALID_NAME");
    }
  }

  export class DuplicateColumnName extends DomainErrors {
    constructor() {
      super("DUPLICATE_COLUMN_NAME");
    }
  }
}