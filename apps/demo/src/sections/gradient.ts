import { bindCircaOutput, requireById } from "../utils/dom";

/**
 * Section 3: Gradient comparison (relative vs absolute) with intensity slider.
 */
export function initGradientSection(): void {
  bindCircaOutput("gradient-relative", "#gradient-relative-output");
  bindCircaOutput("gradient-absolute", "#gradient-absolute-output");

  const relativeInput = requireById("gradient-relative", "gradient");
  const absoluteInput = requireById("gradient-absolute", "gradient");
  const intensitySlider = requireById<HTMLInputElement>(
    "gradient-intensity",
    "gradient",
  );
  const intensityValue = requireById("gradient-intensity-value", "gradient");

  intensitySlider.addEventListener("input", () => {
    const val = intensitySlider.value;
    intensityValue.textContent = val;
    relativeInput.setAttribute("gradient-intensity", val);
    absoluteInput.setAttribute("gradient-intensity", val);
  });

  // Apply initial intensity
  relativeInput.setAttribute("gradient-intensity", intensitySlider.value);
  absoluteInput.setAttribute("gradient-intensity", intensitySlider.value);
}
