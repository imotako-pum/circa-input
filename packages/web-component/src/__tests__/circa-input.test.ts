import { describe, expect, it, beforeEach, afterEach } from "vitest";

// カスタム要素の登録
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

  describe("Shadow DOM 構造", () => {
    it("Shadow Root が存在する", () => {
      expect(el.shadowRoot).not.toBeNull();
    });

    it("track 要素が存在する", () => {
      const track = el.shadowRoot!.querySelector("[part='track']");
      expect(track).not.toBeNull();
    });

    it("value スライダーが存在する", () => {
      const value = el.shadowRoot!.querySelector("[part='value']");
      expect(value).not.toBeNull();
    });

    it("margin 帯が存在する", () => {
      const margin = el.shadowRoot!.querySelector("[part='margin']");
      expect(margin).not.toBeNull();
    });

    it("handle-low/high が存在する", () => {
      const low = el.shadowRoot!.querySelector("[part='handle-low']");
      const high = el.shadowRoot!.querySelector("[part='handle-high']");
      expect(low).not.toBeNull();
      expect(high).not.toBeNull();
    });
  });

  describe("ARIA 属性", () => {
    it("container に role='group' がある", () => {
      const container = el.shadowRoot!.querySelector("[part='container']");
      expect(container?.getAttribute("role")).toBe("group");
    });

    it("value に role='slider' がある", () => {
      const value = el.shadowRoot!.querySelector("[part='value']");
      expect(value?.getAttribute("role")).toBe("slider");
    });

    it("aria-valuemin/max が min/max 属性に一致する", () => {
      const value = el.shadowRoot!.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuemin")).toBe("0");
      expect(value?.getAttribute("aria-valuemax")).toBe("100");
    });

    it("初期状態で aria-valuenow が空文字列", () => {
      const value = el.shadowRoot!.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuenow")).toBe("");
    });
  });

  describe("属性変更", () => {
    it("min/max の変更が反映される", () => {
      el.setAttribute("min", "10");
      el.setAttribute("max", "50");
      const value = el.shadowRoot!.querySelector("[part='value']");
      expect(value?.getAttribute("aria-valuemin")).toBe("10");
      expect(value?.getAttribute("aria-valuemax")).toBe("50");
    });

    it("default-value 属性で初期値を設定できる", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "42");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot!.querySelector("[part='value']");
      expect(slider?.getAttribute("aria-valuenow")).toBe("42");

      el2.remove();
    });
  });

  describe("キーボード操作", () => {
    it("ArrowRight で value が増加する", () => {
      // まず値を設定
      el.setAttribute("default-value", "50");
      // DOMに再追加して反映
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // step="any" の場合は範囲の1% = 1
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("ArrowLeft で value が減少する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));

      expect(slider.getAttribute("aria-valuenow")).toBe("49");
    });

    it("Home で value が min になる", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));

      expect(slider.getAttribute("aria-valuenow")).toBe("0");
    });

    it("End で value が max になる", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));

      expect(slider.getAttribute("aria-valuenow")).toBe("100");
    });

    it("値が未設定の場合、ArrowRightで中央値から開始する", () => {
      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      // 中央値 50 + 1 = 51
      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("step属性が設定されている場合、step刻みで移動する", () => {
      el.setAttribute("step", "5");
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(slider.getAttribute("aria-valuenow")).toBe("55");
    });

    it("Shift+ArrowRight で margin が拡大する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true }),
      );

      // margin が 1 増える（対称モードなので marginLow/High両方）
      // changeイベントで確認する代わりに、circaValueプロパティで確認
      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      expect(circaEl.circaValue.marginLow).toBe(1);
      expect(circaEl.circaValue.marginHigh).toBe(1);
    });

    it("Shift+ArrowLeft で margin が縮小する（0未満にならない）", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      // marginが0の状態で縮小しようとしても0のまま
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      expect(circaEl.circaValue.marginLow).toBe(0);
      expect(circaEl.circaValue.marginHigh).toBe(0);
    });
  });

  describe("circaValue プロパティ", () => {
    it("初期状態では全てnull", () => {
      const circaEl = el as unknown as { readonly circaValue: { value: number | null; marginLow: number | null; marginHigh: number | null } };
      expect(circaEl.circaValue.value).toBeNull();
      expect(circaEl.circaValue.marginLow).toBeNull();
      expect(circaEl.circaValue.marginHigh).toBeNull();
    });

    it("default-value設定時にvalueが反映される", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("default-value", "42");
      document.body.appendChild(el2);

      const circaEl = el2 as unknown as { readonly circaValue: { value: number | null } };
      expect(circaEl.circaValue.value).toBe(42);

      el2.remove();
    });
  });

  describe("change イベント", () => {
    it("キーボード操作で change イベントが発火する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      let detail: unknown = null;
      el.addEventListener("change", ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      expect(detail).not.toBeNull();
      expect((detail as { value: number }).value).toBe(51);
    });
  });
});
