/**
 * Custom error class specific to circa-input.
 */
export class CircaInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircaInputError";
  }
}
