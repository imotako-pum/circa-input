// biome-ignore-all lint/style/noNonNullAssertion: テストではnon-null assertionを使用する
import type { CircaValue } from "@circa-input/core";
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CircaInput } from "../CircaInput";
import type { CircaInputHandle } from "../types";

// カスタム要素の登録
import "@circa-input/web-component";

afterEach(() => {
  cleanup();
});

describe("CircaInput", () => {
  describe("属性マッピング", () => {
    it("min/max が HTML属性に正しく反映される", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("min")).toBe("0");
      expect(el.getAttribute("max")).toBe("100");
    });

    it("value がHTML属性に反映される（Controlledモード）", () => {
      const { container } = render(<CircaInput min={0} max={100} value={42} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("value")).toBe("42");
    });

    it("marginLow/marginHigh が kebab-case 属性に変換される", () => {
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

    it("defaultValue/defaultMarginLow/defaultMarginHigh が正しく変換される", () => {
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

    it("marginMax/distribution/step/name が反映される", () => {
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

  describe("Boolean 属性", () => {
    it("asymmetric=true で属性が付与される", () => {
      const { container } = render(<CircaInput min={0} max={100} asymmetric />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("asymmetric")).toBe(true);
    });

    it("asymmetric=false で属性が除去される", () => {
      const { container } = render(
        <CircaInput min={0} max={100} asymmetric={false} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("asymmetric")).toBe(false);
    });

    it("disabled=true で属性が付与される", () => {
      const { container } = render(<CircaInput min={0} max={100} disabled />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("disabled")).toBe(true);
    });

    it("required=true で属性が付与される", () => {
      const { container } = render(<CircaInput min={0} max={100} required />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("required")).toBe(true);
    });

    it("noClear=true で no-clear 属性が付与される", () => {
      const { container } = render(<CircaInput min={0} max={100} noClear />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("no-clear")).toBe(true);
    });
  });

  describe("null/undefined による属性除去", () => {
    it("value={null} で value 属性が除去される", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} value={50} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("value")).toBe("50");

      rerender(<CircaInput min={0} max={100} value={null} />);
      expect(el.hasAttribute("value")).toBe(false);
    });

    it("undefined のpropsは属性が設定されない", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("value")).toBe(false);
      expect(el.hasAttribute("margin-low")).toBe(false);
      expect(el.hasAttribute("margin-high")).toBe(false);
    });
  });

  describe("イベント", () => {
    it("onChange コールバックが CircaValue を受け取る", () => {
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

    it("onInput コールバックが CircaValue を受け取る", () => {
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

    it("onChange/onInput が更新されたらリスナーも更新される", () => {
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

      // handler1 で受け取る
      el.dispatchEvent(
        new CustomEvent("change", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );
      expect(handler1).toHaveBeenCalledTimes(1);

      // handler2 に差し替え
      rerender(<CircaInput min={0} max={100} onChange={handler2} />);
      el.dispatchEvent(
        new CustomEvent("change", {
          detail: mockValue,
          bubbles: true,
          composed: true,
        }),
      );
      expect(handler2).toHaveBeenCalledTimes(1);
      // handler1 は追加で呼ばれない
      expect(handler1).toHaveBeenCalledTimes(1);
    });
  });

  describe("Ref ハンドル", () => {
    it("circaValue が取得できる", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} defaultValue={42} />);

      expect(ref.current).not.toBeNull();
      expect(ref.current?.circaValue.value).toBe(42);
    });

    it("formValue が JSON 文字列として取得できる", () => {
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

    it("clear() で値がクリアされる", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} defaultValue={50} />);

      expect(ref.current?.circaValue.value).toBe(50);
      ref.current?.clear();
      expect(ref.current?.circaValue.value).toBeNull();
    });

    it("nativeElement で内部のカスタム要素にアクセスできる", () => {
      const ref = createRef<CircaInputHandle>();
      render(<CircaInput ref={ref} min={0} max={100} />);

      const nativeEl = ref.current?.nativeElement;
      expect(nativeEl).not.toBeNull();
      expect(nativeEl?.tagName.toLowerCase()).toBe("circa-input");
    });
  });

  describe("children (slot)", () => {
    it("子要素がレンダリングされる", () => {
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
    it("className がホスト要素に class として設定される", () => {
      const { container } = render(
        <CircaInput min={0} max={100} className="my-slider" />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("class")).toBe("my-slider");
    });

    it("style がホスト要素に適用される", () => {
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

    it("id がホスト要素に設定される", () => {
      const { container } = render(
        <CircaInput min={0} max={100} id="my-circa" />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("id")).toBe("my-circa");
    });
  });

  describe("tickInterval", () => {
    it("tickInterval が tick-interval 属性に変換される", () => {
      const { container } = render(
        <CircaInput min={0} max={100} tickInterval={25} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("tick-interval")).toBe("25");
    });

    it("tickInterval 未指定時は tick-interval 属性がない", () => {
      const { container } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("tick-interval")).toBe(false);
    });

    it("tickInterval を動的に変更すると属性が更新される", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} tickInterval={25} />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("tick-interval")).toBe("25");

      rerender(<CircaInput min={0} max={100} tickInterval={50} />);
      expect(el.getAttribute("tick-interval")).toBe("50");
    });
  });

  describe("props 更新", () => {
    it("min/max を動的に変更すると属性が更新される", () => {
      const { container, rerender } = render(<CircaInput min={0} max={100} />);
      const el = container.querySelector("circa-input")!;
      expect(el.getAttribute("min")).toBe("0");
      expect(el.getAttribute("max")).toBe("100");

      rerender(<CircaInput min={10} max={200} />);
      expect(el.getAttribute("min")).toBe("10");
      expect(el.getAttribute("max")).toBe("200");
    });

    it("boolean属性をtrue→falseに切り替えると属性が除去される", () => {
      const { container, rerender } = render(
        <CircaInput min={0} max={100} disabled />,
      );
      const el = container.querySelector("circa-input")!;
      expect(el.hasAttribute("disabled")).toBe(true);

      rerender(<CircaInput min={0} max={100} disabled={false} />);
      expect(el.hasAttribute("disabled")).toBe(false);
    });
  });
});
