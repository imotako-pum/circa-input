// Types

// Errors
export { CircaErrorCode, CircaInputError } from "./errors.js";
// Helpers
export {
  clamp,
  generateTicks,
  percentToValue,
  toPlainValue,
  valueToPercent,
} from "./helpers.js";
// State
export {
  clampMargins,
  createDefaultConfig,
  createInitialValue,
  snapToStep,
  updateValue,
} from "./state.js";
export type { CircaInputConfig, CircaValue, Distribution } from "./types.js";
// Validation
export { checkRequired, validateConfig, validateValue } from "./validation.js";
