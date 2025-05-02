export class DomainErrors extends Error {
  public readonly code: string;

  constructor(code: string, message?: string) {
    super(message || code); // Utilise `code` comme message si aucun autre n'est spécifié.
    this.code = code;

    // Assure que l'objet est bien une instance de la classe même après transpilation.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainErrors {
  constructor(message = "Validation failed.") {
    super("VALIDATION_ERROR", message);
  }
}

export class PermissionDenied extends DomainErrors {
  constructor(message = "You do not have permission to perform this action.") {
    super("PERMISSION_DENIED", message);
  }
}

export class InternalServerError extends DomainErrors {
  constructor(message = "An unexpected error occurred.") {
    super("INTERNAL_SERVER_ERROR", message);
  }
}

export class NotImplementedError extends DomainErrors {
  constructor(message = "This functionality is not yet implemented.") {
    super("NOT_IMPLEMENTED", message);
  }
}

export class ExternalApiError extends DomainErrors {
  constructor(message = "An error occurred with the external API.") {
    super("EXTERNAL_API_ERROR", message);
  }
}
