// Types

// Errors
export { CircaErrorCode, CircaInputError } from "./errors.js";
// Gradient
export { generateGradientStops } from "./gradient.js";
// Helpers
export {
  clamp,
  deserializeCircaValue,
  generateTicks,
  percentToValue,
  serializeCircaValue,
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
export type {
  BaseDistributionParams,
  CircaInputConfig,
  CircaValue,
  Distribution,
  DistributionParams,
  DistributionParamsMap,
  GradientMode,
  GradientParams,
  GradientStop,
  NormalDistributionParams,
  UniformDistributionParams,
} from "./types.js";
export { DISTRIBUTIONS } from "./types.js";
// Validation
export { checkRequired, validateConfig, validateValue } from "./validation.js";
