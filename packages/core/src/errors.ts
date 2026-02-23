/**
 * circa-input固有のエラークラス
 */
export class CircaInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircaInputError";
  }
}
