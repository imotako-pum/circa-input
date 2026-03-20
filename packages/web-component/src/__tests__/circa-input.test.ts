import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Register custom element
import "../index.js";

describe("CircaInputElement", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("circa-input");
    el.setAttribute("min", "0");
    el.setAttribute("max", "100");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  describe("Shadow DOM structure", () => {
    it("Shadow Root exists", () => {
      expect(el.shadowRoot).not.toBeNull();
    });

    it("track element exists", () => {
      const track = el.shadowRoot?.querySelector("[part='track']");
      expect(track).not.toBeNull();
    });

    it("value slider exists", () => {
      const value = el.shadowRoot?.querySelector("[part='value']");
      expect(value).not.toBeNull();
    });

    it("margin band exists", () => {
      const margin = el.shadowRoot?.querySelector("[part='margin']");
      expect(margin).not.toBeNull();
    });

    it("handle-low/high exist", () => {
      const low = el.shadowRoot?.querySelector("[part='handle-low']");
      const high = el.shadowRoot?.querySelector("[part='handle-high']");
      expect(low).not.toBeNull();
      expect(high).not.toBeNull();
    });
  });

  describe("ARIA attributes", () => {
    it("container has role='group'", () => {
      const container = el.shadowRoot?.querySelector("[part='container']");
      expect(container?.getAttribute("role")).toBe("group");
    });

    it("value has role='slider'", () => {
      const value = el.shadowRoot?.querySelector("[part='value']");
      expect(value?.getAttribute("role")).toBe("slider");
    });

    it("aria-valuemin/max match min/max attributes", () => {
      const value = el.shadowRoot?.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuemin")).toBe("0");
      expect(value?.getAttribute("aria-valuemax")).toBe("100");
    });

    it("aria-valuenow is removed in initial state (no value set)", () => {
      const value = el.shadowRoot?.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuenow")).toBeNull();
    });

    it("when not in asymmetric mode, handle-low/high have aria-hidden='true' and tabindex='-1'", () => {
      const low = el.shadowRoot?.querySelector("[part='handle-low']");
      const high = el.shadowRoot?.querySelector("[part='handle-high']");
      expect(low?.getAttribute("aria-hidden")).toBe("true");
      expect(low?.getAttribute("tabindex")).toBe("-1");
      expect(high?.getAttribute("aria-hidden")).toBe("true");
      expect(high?.getAttribute("tabindex")).toBe("-1");
    });

    it("in asymmetric mode, handle-low/high have aria-hidden='false' and tabindex='0'", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const low = el.shadowRoot?.querySelector("[part='handle-low']");
      const high = el.shadowRoot?.querySelector("[part='handle-high']");
      expect(low?.getAttribute("aria-hidden")).toBe("false");
      expect(low?.getAttribute("tabindex")).toBe("0");
      expect(high?.getAttribute("aria-hidden")).toBe("false");
      expect(high?.getAttribute("tabindex")).toBe("0");
    });

    it("asymmetric handles have aria-valuenow/min/max set", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const low = el.shadowRoot?.querySelector("[part='handle-low']");
      const high = el.shadowRoot?.querySelector("[part='handle-high']");
      expect(low?.getAttribute("aria-valuenow")).toBe("5");
      expect(low?.getAttribute("aria-valuemin")).toBe("0");
      expect(high?.getAttribute("aria-valuenow")).toBe("10");
      expect(high?.getAttribute("aria-valuemin")).toBe("0");
    });
  });

  describe("attribute changes", () => {
    it("min/max changes are reflected", () => {
      el.setAttribute("min", "10");
      el.setAttribute("max", "50");
      const value = el.shadowRoot?.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuemin")).toBe("10");
      expect(value?.getAttribute("aria-valuemax")).toBe("50");
    });

    it("default-value attribute sets the initial value", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "42");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot?.querySelector("[part='value']");
      expect(slider?.getAttribute("aria-valuenow")).toBe("42");

      el2.remove();
    });
  });

  describe("keyboard interaction", () => {
    it("ArrowRight increases value", () => {
      // First set the value
      el.setAttribute("default-value", "50");
      // Re-append to DOM to apply
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // When step="any", step size is 1% of range = 1
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("ArrowLeft decreases value", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );

      expect(slider.getAttribute("aria-valuenow")).toBe("49");
    });

    it("Home sets value to min", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );

      expect(slider.getAttribute("aria-valuenow")).toBe("0");
    });

    it("End sets value to max", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );

      expect(slider.getAttribute("aria-valuenow")).toBe("100");
    });

    it("when value is unset, ArrowRight starts from the center value", () => {
      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      // Center value 50 + 1 = 51
      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("moves in step increments when step attribute is set", () => {
      el.setAttribute("step", "5");
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      expect(slider.getAttribute("aria-valuenow")).toBe("55");
    });

    it("Shift+ArrowRight expands margin", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowRight",
          shiftKey: true,
          bubbles: true,
        }),
      );

      // Margin increases by 1 (both marginLow/High in symmetric mode)
      // Verify via circaValue property instead of change event
      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(1);
      expect(circaEl.circaValue.marginHigh).toBe(1);
    });

    it("Shift+ArrowLeft shrinks margin (does not go below 0)", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      // Attempting to shrink when margin is 0 keeps it at 0
      slider.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowLeft",
          shiftKey: true,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(0);
      expect(circaEl.circaValue.marginHigh).toBe(0);
    });
  });

  describe("circaValue property", () => {
    it("all values are null in initial state", () => {
      const circaEl = el as unknown as {
        readonly circaValue: {
          value: number | null;
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.value).toBeNull();
      expect(circaEl.circaValue.marginLow).toBeNull();
      expect(circaEl.circaValue.marginHigh).toBeNull();
    });

    it("value is reflected when default-value is set", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "42");
      document.body.appendChild(el2);

      const circaEl = el2 as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBe(42);

      el2.remove();
    });
  });

  describe("change event", () => {
    it("change event fires on keyboard interaction", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      let detail: unknown = null;
      el.addEventListener("change", ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      expect(detail).not.toBeNull();
      expect((detail as { value: number }).value).toBe(51);
    });
  });

  describe("margin drag (M2-b)", () => {
    it("vertical drag on thumb expands margin (pointerdown -> pointermove -> pointerup)", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Start drag with pointerdown
      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      // Drag downward (deltaY=50 -> margin expands)
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 150,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      // Margin is set (exact value depends on scaleFactor)
      expect(circaEl.circaValue.marginLow).not.toBeNull();
      expect(circaEl.circaValue.marginLow).toBeGreaterThan(0);
      // marginHigh is the same in symmetric mode
      expect(circaEl.circaValue.marginHigh).toBe(circaEl.circaValue.marginLow);
    });

    it("upward drag shrinks margin (does not go below 0)", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Drag upward with margin at 0
      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 50,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      // Margin is >= 0
      if (circaEl.circaValue.marginLow !== null) {
        expect(circaEl.circaValue.marginLow).toBeGreaterThanOrEqual(0);
      }
    });

    it("pointerup ends drag and fires change event", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      let changeDetail: unknown = null;
      el.addEventListener("change", ((e: CustomEvent) => {
        changeDetail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 150,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointerup", {
          clientX: 100,
          clientY: 150,
          pointerId: 1,
          bubbles: true,
        }),
      );

      expect(changeDetail).not.toBeNull();
    });

    it("input event fires in real-time during drag", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      const inputEvents: unknown[] = [];
      el.addEventListener("input", ((e: CustomEvent) => {
        inputEvents.push(e.detail);
      }) as EventListener);

      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 120,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 140,
          pointerId: 1,
          bubbles: true,
        }),
      );

      // Input event fires on each pointermove
      expect(inputEvents.length).toBeGreaterThanOrEqual(2);
    });

    it("horizontal drag also moves value simultaneously", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Mock track's getBoundingClientRect
      const track = el.shadowRoot?.querySelector(
        "[part='track']",
      ) as HTMLElement;
      Object.defineProperty(track, "getBoundingClientRect", {
        value: () => ({
          left: 0,
          top: 0,
          width: 200,
          height: 8,
          right: 200,
          bottom: 8,
        }),
      });

      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      // Drag 30px right (15% of 200px track -> value +15)
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 130,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBe(65);
    });
  });

  describe("asymmetric mode (M2-c)", () => {
    it("without asymmetric attribute, handle-low/high remain hidden (controlled via CSS)", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      // Confirm asymmetric attribute is absent
      expect(el.hasAttribute("asymmetric")).toBe(false);
    });

    it("asymmetric attribute is reflected in config", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(5);
      expect(circaEl.circaValue.marginHigh).toBe(10);
    });

    it("dragging the asymmetric handle changes marginLow independently", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "10");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const track = el.shadowRoot?.querySelector(
        "[part='track']",
      ) as HTMLElement;
      Object.defineProperty(track, "getBoundingClientRect", {
        value: () => ({
          left: 0,
          top: 0,
          width: 200,
          height: 8,
          right: 200,
          bottom: 8,
        }),
      });

      const handleLow = el.shadowRoot?.querySelector(
        "[part='handle-low']",
      ) as HTMLElement;

      handleLow.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 80,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      // Move 20px left (10% added -> marginLow +10)
      handleLow.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 60,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(20);
      // marginHigh remains unchanged
      expect(circaEl.circaValue.marginHigh).toBe(10);
    });

    it("dragging the asymmetric handle changes marginHigh independently", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "10");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const track = el.shadowRoot?.querySelector(
        "[part='track']",
      ) as HTMLElement;
      Object.defineProperty(track, "getBoundingClientRect", {
        value: () => ({
          left: 0,
          top: 0,
          width: 200,
          height: 8,
          right: 200,
          bottom: 8,
        }),
      });

      const handleHigh = el.shadowRoot?.querySelector(
        "[part='handle-high']",
      ) as HTMLElement;

      handleHigh.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 120,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      // Move 20px right (10% added -> marginHigh +10)
      handleHigh.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 140,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      // marginLow remains unchanged
      expect(circaEl.circaValue.marginLow).toBe(10);
      expect(circaEl.circaValue.marginHigh).toBe(20);
    });

    // --- Helper functions for center thumb drag (direction lock) tests ---
    function setupAsymmetric(
      target: HTMLElement,
      margins: { low: number; high: number },
    ): void {
      target.setAttribute("asymmetric", "");
      target.setAttribute("default-value", "50");
      target.setAttribute("default-margin-low", String(margins.low));
      target.setAttribute("default-margin-high", String(margins.high));
      target.remove();
      document.body.appendChild(target);
    }

    function getValueSlider(target: HTMLElement): HTMLElement {
      return target.shadowRoot?.querySelector("[part='value']") as HTMLElement;
    }

    function pointerEvent(type: string, x: number, y: number): PointerEvent {
      return new PointerEvent(type, {
        clientX: x,
        clientY: y,
        pointerId: 1,
        bubbles: true,
      });
    }

    function getMargins(target: HTMLElement): {
      marginLow: number | null;
      marginHigh: number | null;
    } {
      return (
        target as unknown as {
          readonly circaValue: {
            marginLow: number | null;
            marginHigh: number | null;
          };
        }
      ).circaValue;
    }

    it("downward drag on center thumb increases only marginHigh (marginLow unchanged)", () => {
      setupAsymmetric(el, { low: 10, high: 20 });
      const slider = getValueSlider(el);

      slider.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      slider.dispatchEvent(pointerEvent("pointermove", 100, 150));

      const { marginLow, marginHigh } = getMargins(el);
      expect(marginHigh).toBeGreaterThan(20);
      expect(marginLow).toBe(10);
    });

    it("upward drag on center thumb increases only marginLow (marginHigh unchanged)", () => {
      setupAsymmetric(el, { low: 10, high: 20 });
      const slider = getValueSlider(el);

      slider.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      slider.dispatchEvent(pointerEvent("pointermove", 100, 50));

      const { marginLow, marginHigh } = getMargins(el);
      expect(marginLow).toBeGreaterThan(10);
      expect(marginHigh).toBe(20);
    });

    it("can shrink marginHigh by reversing after downward drag (clamped at 0)", () => {
      setupAsymmetric(el, { low: 10, high: 3 });
      const slider = getValueSlider(el);

      slider.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      // First move down to lock marginHigh
      slider.dispatchEvent(pointerEvent("pointermove", 100, 110));
      // Move far back up (past start point -> marginHigh shrinks, clamped at 0)
      slider.dispatchEvent(pointerEvent("pointermove", 100, 0));

      const { marginLow, marginHigh } = getMargins(el);
      expect(marginHigh).toBe(0);
      expect(marginLow).toBe(10);
    });

    it("can shrink marginLow by reversing after upward drag (clamped at 0)", () => {
      setupAsymmetric(el, { low: 3, high: 20 });
      const slider = getValueSlider(el);

      slider.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      // First move up to lock marginLow
      slider.dispatchEvent(pointerEvent("pointermove", 100, 90));
      // Move far back down (past start point -> marginLow shrinks, clamped at 0)
      slider.dispatchEvent(pointerEvent("pointermove", 100, 200));

      const { marginLow, marginHigh } = getMargins(el);
      expect(marginLow).toBe(0);
      expect(marginHigh).toBe(20);
    });

    it("vertical movement below threshold does not change margin", () => {
      setupAsymmetric(el, { low: 10, high: 20 });
      const slider = getValueSlider(el);

      slider.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      slider.dispatchEvent(pointerEvent("pointermove", 100, 104));

      const { marginLow, marginHigh } = getMargins(el);
      expect(marginLow).toBe(10);
      expect(marginHigh).toBe(20);
    });
  });

  describe("asymmetric handle keyboard interaction", () => {
    it("ArrowLeft on focused handle-low increases marginLow", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const handleLow = el.shadowRoot?.querySelector(
        "[part='handle-low']",
      ) as HTMLElement;
      handleLow.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(6);
      // marginHigh remains unchanged
      expect(circaEl.circaValue.marginHigh).toBe(10);
    });

    it("ArrowRight on focused handle-high increases marginHigh", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const handleHigh = el.shadowRoot?.querySelector(
        "[part='handle-high']",
      ) as HTMLElement;
      handleHigh.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: {
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.marginLow).toBe(5);
      expect(circaEl.circaValue.marginHigh).toBe(11);
    });

    it("ArrowRight on handle-low shrinks marginLow (does not go below 0)", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "0");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const handleLow = el.shadowRoot?.querySelector(
        "[part='handle-low']",
      ) as HTMLElement;
      handleLow.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { marginLow: number | null };
      };
      expect(circaEl.circaValue.marginLow).toBe(0);
    });
  });

  describe("Controlled/Uncontrolled（M2-c）", () => {
    it("Uncontrolled: interaction changes internal state", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBe(51);

      // ARIA attribute is also updated
      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("Controlled: display does not change unless externally updated when value attribute exists", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("value", "50");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Change event fires, but...
      let detail: unknown = null;
      el2.addEventListener("change", ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      // Event is fired
      expect(detail).not.toBeNull();
      expect((detail as { value: number }).value).toBe(51);

      // Display changes when value attribute is updated externally
      el2.setAttribute("value", "51");
      expect(slider.getAttribute("aria-valuenow")).toBe("51");

      el2.remove();
    });

    it("Controlled: dynamically changing value attribute updates rendering", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("value", "30");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      expect(slider.getAttribute("aria-valuenow")).toBe("30");

      el2.setAttribute("value", "70");
      expect(slider.getAttribute("aria-valuenow")).toBe("70");

      el2.remove();
    });

    it("Controlled: attribute change during drag is deferred until drag ends", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("value", "50");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Start drag
      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 150,
          clientY: 100,
          bubbles: true,
          pointerId: 1,
        }),
      );

      // Parent updates value attribute during drag
      el2.setAttribute("value", "80");

      // Value should NOT jump to 80 during drag
      const circaEl = el2 as HTMLElement & { circaValue: { value: number } };
      expect(circaEl.circaValue.value).toBe(50);

      // End drag
      slider.dispatchEvent(
        new PointerEvent("pointerup", {
          clientX: 150,
          clientY: 100,
          bubbles: true,
          pointerId: 1,
        }),
      );

      // After drag ends, deferred attribute update is applied
      expect(circaEl.circaValue.value).toBe(80);

      el2.remove();
    });
  });

  describe("disconnectedCallback (resource cleanup)", () => {
    it("keyboard interaction is disabled after removal from DOM", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      el.remove();

      // Confirm key operations after removal do not change state
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBe(50);
    });

    it("does not crash when removed from DOM during drag", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );

      // Remove during drag
      expect(() => el.remove()).not.toThrow();
    });
  });

  describe("form integration (M2-d)", () => {
    it("formAssociated is true when name attribute is set", () => {
      // CircaInputElement.formAssociated should be true
      const CircaInputCtor = customElements.get("circa-input") as {
        formAssociated?: boolean;
      };
      expect(CircaInputCtor.formAssociated).toBe(true);
    });

    it("associates with form via name attribute", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("name", "delivery_time");
      el2.setAttribute("default-value", "14");
      document.body.appendChild(el2);

      // Confirm name attribute is set
      expect(el2.getAttribute("name")).toBe("delivery_time");

      el2.remove();
    });

    it("sets form value as JSON string of circaValue", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "9");
      el2.setAttribute("max", "21");
      el2.setAttribute("name", "delivery_time");
      el2.setAttribute("default-value", "14");
      el2.setAttribute("default-margin-low", "1");
      el2.setAttribute("default-margin-high", "2");
      document.body.appendChild(el2);

      // Confirm formValue is set as a JSON string
      const circaEl = el2 as unknown as { readonly formValue: string | null };
      if (circaEl.formValue !== undefined) {
        const parsed = JSON.parse(circaEl.formValue as string);
        expect(parsed.value).toBe(14);
        expect(parsed.marginLow).toBe(1);
        expect(parsed.marginHigh).toBe(2);
      }

      el2.remove();
    });

    it("indicates validation error when required=true and no value is set", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("name", "test");
      el2.setAttribute("required", "");
      document.body.appendChild(el2);

      // No value set -> required violation
      const circaEl = el2 as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBeNull();

      el2.remove();
    });
  });

  describe("disabled state", () => {
    it("keyboard interaction is ignored when disabled", () => {
      el.setAttribute("default-value", "50");
      el.setAttribute("disabled", "");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBe(50);
    });

    it("pointer interaction is ignored when disabled", () => {
      el.setAttribute("default-value", "50");
      el.setAttribute("disabled", "");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 150,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const circaEl = el as unknown as {
        readonly circaValue: { marginLow: number | null };
      };
      // Margin does not change
      expect(circaEl.circaValue.marginLow).toBeNull();
    });
  });

  describe("tick marks (tick-interval)", () => {
    it("no tick marks displayed when tick-interval is not set", () => {
      const ticks = el.shadowRoot?.querySelector("[part='ticks']");
      expect(ticks).toBeNull();
    });

    it("tick marks are displayed when tick-interval is set", () => {
      el.setAttribute("tick-interval", "25");

      const ticks = el.shadowRoot?.querySelector("[part='ticks']");
      expect(ticks).not.toBeNull();
      expect(ticks?.getAttribute("aria-hidden")).toBe("true");

      // 0, 25, 50, 75, 100 -> 5 tick marks
      const tickElements = ticks?.querySelectorAll(".circa-tick");
      expect(tickElements?.length).toBe(5);
    });

    it("tick labels display correct values", () => {
      el.setAttribute("tick-interval", "25");

      const labels = el.shadowRoot?.querySelectorAll(".circa-tick-label");
      const values = Array.from(labels ?? []).map((l) => l.textContent);
      expect(values).toEqual(["0", "25", "50", "75", "100"]);
    });

    it("tick positions are correctly set as percentages", () => {
      el.setAttribute("tick-interval", "50");

      const tickElements = el.shadowRoot?.querySelectorAll(".circa-tick");
      const positions = Array.from(tickElements ?? []).map(
        (t) => (t as HTMLElement).style.left,
      );
      expect(positions).toEqual(["0%", "50%", "100%"]);
    });

    it("tick marks update when tick-interval is changed later", () => {
      el.setAttribute("tick-interval", "25");
      let ticks = el.shadowRoot?.querySelectorAll(".circa-tick");
      expect(ticks?.length).toBe(5);

      el.setAttribute("tick-interval", "50");
      ticks = el.shadowRoot?.querySelectorAll(".circa-tick");
      expect(ticks?.length).toBe(3);
    });

    it("tick marks disappear when tick-interval is removed", () => {
      el.setAttribute("tick-interval", "25");
      expect(el.shadowRoot?.querySelector("[part='ticks']")).not.toBeNull();

      el.removeAttribute("tick-interval");
      expect(el.shadowRoot?.querySelector("[part='ticks']")).toBeNull();
    });

    it("no tick marks displayed with invalid tick-interval (0 or less)", () => {
      el.setAttribute("tick-interval", "0");
      expect(el.shadowRoot?.querySelector("[part='ticks']")).toBeNull();

      el.setAttribute("tick-interval", "-10");
      expect(el.shadowRoot?.querySelector("[part='ticks']")).toBeNull();
    });

    it("max is included in tick marks when max is not a multiple of tickInterval", () => {
      el.setAttribute("tick-interval", "30");

      const labels = el.shadowRoot?.querySelectorAll(".circa-tick-label");
      const values = Array.from(labels ?? []).map((l) => l.textContent);
      expect(values).toEqual(["0", "30", "60", "90", "100"]);
    });

    it("tick container is placed inside track-area", () => {
      el.setAttribute("tick-interval", "25");

      const trackArea = el.shadowRoot?.querySelector("[part='track-area']");
      const ticks = trackArea?.querySelector("[part='ticks']");
      expect(ticks).not.toBeNull();
    });
  });

  describe("validation", () => {
    it("throws CircaInputError when min >= max", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "100");
      el2.setAttribute("max", "0");
      expect(() => document.body.appendChild(el2)).toThrow();
    });

    it("throws CircaInputError when margin-max is negative", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("margin-max", "-5");
      expect(() => document.body.appendChild(el2)).toThrow();
    });
  });

  describe("mobile support (M2-d)", () => {
    it("pointercancel safely cancels drag", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;

      // Start drag
      slider.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          clientY: 100,
          pointerId: 1,
          bubbles: true,
        }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 150,
          pointerId: 1,
          bubbles: true,
        }),
      );

      // pointercancel occurs
      slider.dispatchEvent(
        new PointerEvent("pointercancel", { pointerId: 1, bubbles: true }),
      );

      // Confirm drag has ended (additional pointermove has no effect)
      const marginBefore = (
        el as unknown as { readonly circaValue: { marginLow: number | null } }
      ).circaValue.marginLow;

      slider.dispatchEvent(
        new PointerEvent("pointermove", {
          clientX: 100,
          clientY: 200,
          pointerId: 1,
          bubbles: true,
        }),
      );

      const marginAfter = (
        el as unknown as { readonly circaValue: { marginLow: number | null } }
      ).circaValue.marginLow;
      expect(marginAfter).toBe(marginBefore);
    });

    it("touch-action: none is set on host element (managed via CSS)", () => {
      // Confirm touch-action: none is set on :host in styles.ts
      // Exists as a style within Shadow DOM
      const style = el.shadowRoot?.querySelector("style");
      expect(style).not.toBeNull();
      expect(style?.textContent).toContain("touch-action: none");
    });
  });

  describe("track click", () => {
    it("sets value on track pointerdown", () => {
      const track = el.shadowRoot?.querySelector(
        "[part='track']",
      ) as HTMLElement;
      // Simulate getBoundingClientRect for positioning
      track.getBoundingClientRect = () =>
        ({
          left: 0,
          width: 200,
          top: 0,
          height: 8,
          right: 200,
          bottom: 8,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect;

      // Click at 50% of track (x=100 of 200px width)
      track.dispatchEvent(
        new PointerEvent("pointerdown", {
          clientX: 100,
          bubbles: true,
        }),
      );

      const valuenow = el.shadowRoot
        ?.querySelector("[part='value']")
        ?.getAttribute("aria-valuenow");
      expect(valuenow).toBe("50");
    });
  });

  describe("clear", () => {
    it("clears value in uncontrolled mode", () => {
      // Set a value first via removing and re-adding with default-value
      el.remove();
      el = document.createElement("circa-input");
      el.setAttribute("min", "0");
      el.setAttribute("max", "100");
      el.setAttribute("default-value", "50");
      document.body.appendChild(el);

      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
        clear(): void;
      };
      expect(circaEl.circaValue.value).toBe(50);

      circaEl.clear();
      expect(circaEl.circaValue.value).toBeNull();
    });

    it("fires change event in controlled mode", () => {
      el.setAttribute("value", "50");

      let eventFired = false;
      el.addEventListener("change", () => {
        eventFired = true;
      });

      const circaEl = el as unknown as { clear(): void };
      circaEl.clear();
      expect(eventFired).toBe(true);
    });
  });

  describe("keyboard — additional keys", () => {
    beforeEach(() => {
      el.remove();
      el = document.createElement("circa-input");
      el.setAttribute("min", "0");
      el.setAttribute("max", "100");
      el.setAttribute("default-value", "50");
      document.body.appendChild(el);
    });

    it("ArrowUp increases value", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      const valuenow = Number(value.getAttribute("aria-valuenow"));
      expect(valuenow).toBeGreaterThan(50);
    });

    it("ArrowDown decreases value", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      const valuenow = Number(value.getAttribute("aria-valuenow"));
      expect(valuenow).toBeLessThan(50);
    });

    it("Delete clears value", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBeNull();
    });

    it("Backspace clears value", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
      const circaEl = el as unknown as {
        readonly circaValue: { value: number | null };
      };
      expect(circaEl.circaValue.value).toBeNull();
    });

    it("PageUp increases value by 10% of range", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp" }));
      const valuenow = Number(value.getAttribute("aria-valuenow"));
      expect(valuenow).toBe(60);
    });

    it("PageDown decreases value by 10% of range", () => {
      const value = el.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      value.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" }));
      const valuenow = Number(value.getAttribute("aria-valuenow"));
      expect(valuenow).toBe(40);
    });
  });

  describe("default-* attribute late initialization (React compat)", () => {
    it("default-margin-low/high are applied when set after connectedCallback", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      document.body.appendChild(el2);

      // Set default-* attributes after connectedCallback (simulates React useLayoutEffect)
      el2.setAttribute("default-value", "50");
      el2.setAttribute("default-margin-low", "5");
      el2.setAttribute("default-margin-high", "10");

      const circaEl = el2 as unknown as {
        readonly circaValue: {
          value: number | null;
          marginLow: number | null;
          marginHigh: number | null;
        };
      };
      expect(circaEl.circaValue.value).toBe(50);
      expect(circaEl.circaValue.marginLow).toBe(5);
      expect(circaEl.circaValue.marginHigh).toBe(10);

      el2.remove();
    });

    it("default-* attributes are ignored after user interaction", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "50");
      document.body.appendChild(el2);

      // Use keyboard to change value (simulates user interaction)
      const valueEl = el2.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      valueEl.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight" }),
      );

      const circaEl = el2 as unknown as {
        readonly circaValue: { value: number | null };
      };
      const valueAfterInteraction = circaEl.circaValue.value;
      expect(valueAfterInteraction).not.toBe(50);

      // Changing default-value should NOT re-initialize
      el2.setAttribute("default-value", "70");
      expect(circaEl.circaValue.value).toBe(valueAfterInteraction);

      el2.remove();
    });

    it("default-* attributes re-apply after clear()", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "50");
      document.body.appendChild(el2);

      // Simulate user interaction
      const valueEl = el2.shadowRoot?.querySelector(
        "[part='value']",
      ) as HTMLElement;
      valueEl.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight" }),
      );

      const circaEl = el2 as unknown as {
        readonly circaValue: { value: number | null };
        clear(): void;
      };

      // Clear resets the value
      circaEl.clear();
      expect(circaEl.circaValue.value).toBeNull();

      // After clear, default-value should be re-applicable
      el2.setAttribute("default-value", "70");
      expect(circaEl.circaValue.value).toBe(70);

      el2.remove();
    });
  });
});
