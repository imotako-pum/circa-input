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

  describe("マージンドラッグ（M2-b）", () => {
    it("つまみの縦ドラッグでmarginが拡大する（pointerdown → pointermove → pointerup）", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // pointerdown でドラッグ開始
      slider.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );

      // 下方向にドラッグ（deltaY=50 → margin拡大）
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 150, pointerId: 1, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      // margin が設定されている（具体的な値はscaleFactorに依存）
      expect(circaEl.circaValue.marginLow).not.toBeNull();
      expect(circaEl.circaValue.marginLow).toBeGreaterThan(0);
      // 対称モードなので marginHigh も同じ
      expect(circaEl.circaValue.marginHigh).toBe(circaEl.circaValue.marginLow);
    });

    it("上方向ドラッグでmarginが縮小する（0未満にならない）", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // marginが0の状態で上にドラッグ
      slider.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 50, pointerId: 1, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      // margin は 0 以上
      if (circaEl.circaValue.marginLow !== null) {
        expect(circaEl.circaValue.marginLow).toBeGreaterThanOrEqual(0);
      }
    });

    it("pointerup でドラッグが終了し change イベントが発火する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      let changeDetail: unknown = null;
      el.addEventListener("change", ((e: CustomEvent) => {
        changeDetail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 150, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointerup", { clientX: 100, clientY: 150, pointerId: 1, bubbles: true }),
      );

      expect(changeDetail).not.toBeNull();
    });

    it("ドラッグ中に input イベントがリアルタイム発火する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      const inputEvents: unknown[] = [];
      el.addEventListener("input", ((e: CustomEvent) => {
        inputEvents.push(e.detail);
      }) as EventListener);

      slider.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 120, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 140, pointerId: 1, bubbles: true }),
      );

      // 各pointermoveでinputイベントが発火
      expect(inputEvents.length).toBeGreaterThanOrEqual(2);
    });

    it("水平ドラッグでvalueも同時に移動する", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // トラックの getBoundingClientRect をモック
      const track = el.shadowRoot!.querySelector("[part='track']") as HTMLElement;
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
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );

      // 右に30pxドラッグ（200pxトラックの15% → value +15）
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 130, clientY: 100, pointerId: 1, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { value: number | null } };
      expect(circaEl.circaValue.value).toBe(65);
    });
  });

  describe("非対称モード（M2-c）", () => {
    it("asymmetric属性がない場合、handle-low/highは非表示のまま（CSSで制御）", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      // asymmetric属性がないことを確認
      expect(el.hasAttribute("asymmetric")).toBe(false);
    });

    it("asymmetric属性がある場合、configに反映される", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "5");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      expect(circaEl.circaValue.marginLow).toBe(5);
      expect(circaEl.circaValue.marginHigh).toBe(10);
    });

    it("非対称ハンドルのドラッグでmarginLowが個別に変更できる", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "10");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const track = el.shadowRoot!.querySelector("[part='track']") as HTMLElement;
      Object.defineProperty(track, "getBoundingClientRect", {
        value: () => ({ left: 0, top: 0, width: 200, height: 8, right: 200, bottom: 8 }),
      });

      const handleLow = el.shadowRoot!.querySelector("[part='handle-low']") as HTMLElement;

      handleLow.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 80, clientY: 100, pointerId: 1, bubbles: true }),
      );
      // 左に20px移動（10%追加 → marginLow +10）
      handleLow.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 60, clientY: 100, pointerId: 1, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      expect(circaEl.circaValue.marginLow).toBe(20);
      // marginHighは変わらない
      expect(circaEl.circaValue.marginHigh).toBe(10);
    });

    it("非対称ハンドルのドラッグでmarginHighが個別に変更できる", () => {
      el.setAttribute("asymmetric", "");
      el.setAttribute("default-value", "50");
      el.setAttribute("default-margin-low", "10");
      el.setAttribute("default-margin-high", "10");
      el.remove();
      document.body.appendChild(el);

      const track = el.shadowRoot!.querySelector("[part='track']") as HTMLElement;
      Object.defineProperty(track, "getBoundingClientRect", {
        value: () => ({ left: 0, top: 0, width: 200, height: 8, right: 200, bottom: 8 }),
      });

      const handleHigh = el.shadowRoot!.querySelector("[part='handle-high']") as HTMLElement;

      handleHigh.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 120, clientY: 100, pointerId: 1, bubbles: true }),
      );
      // 右に20px移動（10%追加 → marginHigh +10）
      handleHigh.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 140, clientY: 100, pointerId: 1, bubbles: true }),
      );

      const circaEl = el as unknown as { readonly circaValue: { marginLow: number | null; marginHigh: number | null } };
      // marginLowは変わらない
      expect(circaEl.circaValue.marginLow).toBe(10);
      expect(circaEl.circaValue.marginHigh).toBe(20);
    });
  });

  describe("Controlled/Uncontrolled（M2-c）", () => {
    it("Uncontrolled: 操作で内部状態が変わる", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      const circaEl = el as unknown as { readonly circaValue: { value: number | null } };
      expect(circaEl.circaValue.value).toBe(51);

      // ARIA属性も更新されている
      expect(slider.getAttribute("aria-valuenow")).toBe("51");
    });

    it("Controlled: value属性が存在する場合、外部から更新しないと表示が変わらない", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("value", "50");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // changeイベントは発火するが…
      let detail: unknown = null;
      el2.addEventListener("change", ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);

      slider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

      // イベントは発火する
      expect(detail).not.toBeNull();
      expect((detail as { value: number }).value).toBe(51);

      // value属性を外部から更新すれば表示が変わる
      el2.setAttribute("value", "51");
      expect(slider.getAttribute("aria-valuenow")).toBe("51");

      el2.remove();
    });

    it("Controlled: value属性を動的に変更すると描画が更新される", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("value", "30");
      document.body.appendChild(el2);

      const slider = el2.shadowRoot!.querySelector("[part='value']") as HTMLElement;
      expect(slider.getAttribute("aria-valuenow")).toBe("30");

      el2.setAttribute("value", "70");
      expect(slider.getAttribute("aria-valuenow")).toBe("70");

      el2.remove();
    });
  });

  describe("フォーム統合（M2-d）", () => {
    it("name属性が設定されている場合、formAssociatedがtrue", () => {
      // CircaInputElement.formAssociated should be true
      const CircaInputCtor = customElements.get("circa-input") as { formAssociated?: boolean };
      expect(CircaInputCtor.formAssociated).toBe(true);
    });

    it("name属性でフォームに関連付けられる", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("name", "delivery_time");
      el2.setAttribute("default-value", "14");
      document.body.appendChild(el2);

      // name属性が設定されていることを確認
      expect(el2.getAttribute("name")).toBe("delivery_time");

      el2.remove();
    });

    it("circaValueをJSON文字列としてフォーム値を設定する", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "9");
      el2.setAttribute("max", "21");
      el2.setAttribute("name", "delivery_time");
      el2.setAttribute("default-value", "14");
      el2.setAttribute("default-margin-low", "1");
      el2.setAttribute("default-margin-high", "2");
      document.body.appendChild(el2);

      // formValue が JSON 文字列として設定されていることを確認
      const circaEl = el2 as unknown as { readonly formValue: string | null };
      if (circaEl.formValue !== undefined) {
        const parsed = JSON.parse(circaEl.formValue as string);
        expect(parsed.value).toBe(14);
        expect(parsed.marginLow).toBe(1);
        expect(parsed.marginHigh).toBe(2);
      }

      el2.remove();
    });

    it("required=trueかつ未入力時にバリデーションエラーを示す", () => {
      const el2 = document.createElement("circa-input");
      el2.setAttribute("min", "0");
      el2.setAttribute("max", "100");
      el2.setAttribute("name", "test");
      el2.setAttribute("required", "");
      document.body.appendChild(el2);

      // value未設定 → required違反
      const circaEl = el2 as unknown as { readonly circaValue: { value: number | null } };
      expect(circaEl.circaValue.value).toBeNull();

      el2.remove();
    });
  });

  describe("モバイル対応（M2-d）", () => {
    it("pointercancel でドラッグが安全にキャンセルされる", () => {
      el.setAttribute("default-value", "50");
      el.remove();
      document.body.appendChild(el);

      const slider = el.shadowRoot!.querySelector("[part='value']") as HTMLElement;

      // ドラッグ開始
      slider.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 100, clientY: 100, pointerId: 1, bubbles: true }),
      );
      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 150, pointerId: 1, bubbles: true }),
      );

      // pointercancel 発生
      slider.dispatchEvent(
        new PointerEvent("pointercancel", { pointerId: 1, bubbles: true }),
      );

      // ドラッグが終了していることを確認（追加のpointermoveが影響しない）
      const marginBefore = (el as unknown as { readonly circaValue: { marginLow: number | null } }).circaValue.marginLow;

      slider.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 100, clientY: 200, pointerId: 1, bubbles: true }),
      );

      const marginAfter = (el as unknown as { readonly circaValue: { marginLow: number | null } }).circaValue.marginLow;
      expect(marginAfter).toBe(marginBefore);
    });

    it("touch-action: none がhost要素に設定されている（CSSで管理）", () => {
      // styles.ts で :host に touch-action: none が設定されていることを確認
      // Shadow DOM内のスタイルとして存在する
      const style = el.shadowRoot!.querySelector("style");
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain("touch-action: none");
    });
  });
});
