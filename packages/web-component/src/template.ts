/**
 * Shadow DOM HTML template construction
 */
import { STYLES } from "./styles.js";

/**
 * Cached template. Created once on first use and reused via cloneNode.
 * NOTE: innerHTML uses only static fixed strings and does not include
 * user input, so there is no XSS risk.
 */
let cachedTemplate: HTMLTemplateElement | null = null;

/** Return the initial HTML template for the Shadow DOM. Cached at module scope for reuse. */
export function createTemplate(): HTMLTemplateElement {
  if (cachedTemplate) return cachedTemplate;

  const template = document.createElement("template");
  // Only static fixed HTML strings are used (no user input)
  // track-area is a container for track and ticks. Ticks are dynamically added via JS.
  template.innerHTML = `<div part="container" role="group" aria-label="circa input"><div part="track-area"><div part="track"><div part="margin" aria-hidden="true"></div><div part="value" role="slider" tabindex="0" aria-label="center value" aria-valuemin="" aria-valuemax=""></div><div part="handle-low" role="slider" tabindex="-1" aria-label="lower margin" aria-hidden="true"></div><div part="handle-high" role="slider" tabindex="-1" aria-label="upper margin" aria-hidden="true"></div></div></div><div part="clear-area"><slot name="clear"><button part="clear" type="button" aria-label="clear value"><svg viewBox="0 0 12 12" width="60%" height="60%" aria-hidden="true"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></slot></div></div>`;

  const style = document.createElement("style");
  style.textContent = STYLES;
  template.content.prepend(style);

  cachedTemplate = template;
  return template;
}
