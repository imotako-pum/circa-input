// biome-ignore-all lint/style/noNonNullAssertion: non-null assertions are used in tests
import type { CircaValue } from "@circa-input/core";
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CircaInput } from "../CircaInput";
import type { CircaInputHandle } from "../types";

// Register the custom element
import "@circa-input/web-component";

afterEach(() => {
  cleanup();
});

describe("CircaInput", () => {
  describe("Attribute mapping", () => {
    it("min/max are correctly reflected as HTML attributes", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("min")).toBe("0");
      expect(el.getAttribute("max")).toBe("100");
    });

    it("value is reflected as HTML attribute (controlled mode)", () => {
      const { container } = render(<CircaInput min={0} max={100} value={42} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("value")).toBe("42");
    });

    it("marginLow/marginHigh are converted to kebab-case attributes", () => {
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          value={50}
          marginLow={5}
          marginHigh={10}
        />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("margin-low")).toBe("5");
      expect(el.getAttribute("margin-high")).toBe("10");
    });

    it("defaultValue/defaultMarginLow/defaultMarginHigh are correctly converted", () => {
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          defaultValue={50}
          defaultMarginLow={3}
          defaultMarginHigh={7}
        />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("default-value")).toBe("50");
      expect(el.getAttribute("default-margin-low")).toBe("3");
      expect(el.getAttribute("default-margin-high")).toBe("7");
    });

    it("marginMax/distribution/step/name are reflected", () => {
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          marginMax={20}
          distribution="uniform"
          step={5}
          name="test-field"
        />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("margin-max")).toBe("20");
      expect(el.getAttribute("distribution")).toBe("uniform");
      expect(el.getAttribute("step")).toBe("5");
      expect(el.getAttribute("name")).toBe("test-field");
    });
  });

  describe("Boolean attributes", () => {
    it("asymmetric=true adds the attribute", () => {
      const { container } = render(<CircaInput min={0} max={100} asymmetric />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("asymmetric")).toBe(true);
    });

    it("asymmetric=false removes the attribute", () => {
      const { container } = render(
        <CircaInput min={0} max={100} asymmetric={false} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("asymmetric")).toBe(false);
    });

    it("disabled=true adds the attribute", () => {
      const { container } = render(<CircaInput min={0} max={100} disabled />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("disabled")).toBe(true);
    });

    it("required=true adds the attribute", () => {
      const { container } = render(<CircaInput min={0} max={100} required />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("required")).toBe(true);
    });

    it("noClear=true adds the no-clear attribute", () => {
      const { container } = render(<CircaInput min={0} max={100} noClear />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("no-clear")).toBe(true);
    });
  });

  describe("Attribute removal via null/undefined", () => {
    it("value={null} removes the value attribute", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} value={50} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("value")).toBe("50");

      rerender(<CircaInput min={0} max={100} value={null} />);
      expect(el.hasAttribute("value")).toBe(false);
    });

    it("undefined props do not set attributes", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("value")).toBe(false);
      expect(el.hasAttribute("margin-low")).toBe(false);
      expect(el.hasAttribute("margin-high")).toBe(false);
    });
  });

  describe("Events", () => {
    it("onChange callback receives CircaValue", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          defaultValue={50}
          onChange={handleChange}
        />,
      );
      const el = container.querySelector("circa-input")!;

      const mockValue: CircaValue = {
        value: 51,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };

      el.dispatchEvent(
        new CustomEvent("change", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(mockValue);
    });

    it("onInput callback receives CircaValue", () => {
      const handleInput = vi.fn();
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          defaultValue={50}
          onInput={handleInput}
        />,
      );
      const el = container.querySelector("circa-input")!;

      const mockValue: CircaValue = {
        value: 55,
        marginLow: 5,
        marginHigh: 5,
        distribution: "normal",
        distributionParams: {},
      };

      el.dispatchEvent(
        new CustomEvent("input", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );

      expect(handleInput).toHaveBeenCalledTimes(1);
      expect(handleInput).toHaveBeenCalledWith(mockValue);
    });

    it("listeners update when onChange/onInput are updated", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const { container, rerender } = render(
        <CircaInput min={0} max={100} onChange={handler1} />,
      );
      const el = container.querySelector("circa-input")!;

      const mockValue: CircaValue = {
        value: 50,
        marginLow: null,
        marginHigh: null,
        distribution: "normal",
        distributionParams: {},
      };

      // Received by handler1
      el.dispatchEvent(
        new CustomEvent("change", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );
      expect(handler1).toHaveBeenCalledTimes(1);

      // Switch to handler2
      rerender(<CircaInput min={0} max={100} onChange={handler2} />);
      el.dispatchEvent(
        new CustomEvent("change", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );
      expect(handler2).toHaveBeenCalledTimes(1);
      // handler1 is not called again
      expect(handler1).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ref handle", () => {
    it("circaValue can be retrieved", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} defaultValue={42} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.circaValue.value).toBe(42);
    });

    it("formValue can be retrieved as a JSON string", () => {
      const ref = createRef<CircaInputHandle>();
      render(
        <CircaInput
          ref={ref}
          min={0}
          max={100}
          defaultValue={50}
          defaultMarginLow={5}
          defaultMarginHigh={10}
        />,
      );

      const formValue = ref.current?.formValue;
      expect(formValue).not.toBeNull();
      const parsed = JSON.parse(formValue!);
      expect(parsed.value).toBe(50);
      expect(parsed.marginLow).toBe(5);
      expect(parsed.marginHigh).toBe(10);
    });

    it("clear() clears the value", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} defaultValue={50} />);

      expect(ref.current?.circaValue.value).toBe(50);
      ref.current?.clear();
      expect(ref.current?.circaValue.value).toBeNull();
    });

    it("nativeElement provides access to the internal custom element", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} />);

      const nativeEl = ref.current?.nativeElement;
      expect(nativeEl).not.toBeNull();
      expect(nativeEl?.tagName.toLowerCase()).toBe("circa-input");
    });
  });

  describe("children (slot)", () => {
    it("children are rendered", () => {
      const { container } = render(
        <CircaInput min={0} max={100}>
          <button type="button" slot="clear">
            ×
          </button>
        </CircaInput>,
      );
      const el = container.querySelector("circa-input")!;
      const button = el.querySelector("button[slot='clear']");
      expect(button).not.toBeNull();
      expect(button?.textContent).toBe("×");
    });
  });

  describe("className / style / id", () => {
    it("className is set as class on the host element", () => {
      const { container } = render(
        <CircaInput min={0} max={100} className="my-slider" />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("class")).toBe("my-slider");
    });

    it("style is applied to the host element", () => {
      const { container } = render(
        <CircaInput
          min={0}
          max={100}
          style={{ width: "300px", marginTop: "10px" }}
        />,
      );
      const el = container.querySelector("circa-input")! as HTMLElement;
      expect(el.style.width).toBe("300px");
    });

    it("id is set on the host element", () => {
      const { container } = render(
        <CircaInput min={0} max={100} id="my-circa" />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("id")).toBe("my-circa");
    });
  });

  describe("tickInterval", () => {
    it("tickInterval is converted to tick-interval attribute", () => {
      const { container } = render(
        <CircaInput min={0} max={100} tickInterval={25} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("tick-interval")).toBe("25");
    });

    it("tick-interval attribute is absent when tickInterval is not specified", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("tick-interval")).toBe(false);
    });

    it("dynamically changing tickInterval updates the attribute", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} tickInterval={25} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("tick-interval")).toBe("25");

      rerender(<CircaInput min={0} max={100} tickInterval={50} />);
      expect(el.getAttribute("tick-interval")).toBe("50");
    });
  });

  describe("Props update", () => {
    it("dynamically changing min/max updates the attributes", () => {
      const { container, rerender } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("min")).toBe("0");
      expect(el.getAttribute("max")).toBe("100");

      rerender(<CircaInput min={10} max={200} />);
      expect(el.getAttribute("min")).toBe("10");
      expect(el.getAttribute("max")).toBe("200");
    });

    it("switching a boolean attribute from true to false removes the attribute", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} disabled />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("disabled")).toBe(true);

      rerender(<CircaInput min={0} max={100} disabled={false} />);
      expect(el.hasAttribute("disabled")).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("removes event listeners on unmount", () => {
      const onChange = vi.fn();
      const { unmount, container } = render(
        <CircaInput min={0} max={100} onChange={onChange} />,
      );
      const el = container.querySelector("circa-input")!;

      unmount();

      // After unmount, dispatching a change event should not call onChange
      el.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            value: 42,
            marginLow: null,
            marginHigh: null,
            distribution: "normal",
            distributionParams: {},
          },
        }),
      );
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
