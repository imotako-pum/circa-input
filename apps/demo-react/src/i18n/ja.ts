import type { Translations } from "./types";

export const ja: Translations = {
  "hero.title": "circa-input React Demo",
  "hero.subtitle": "@circa-input/react パッケージの使い方デモ",

  "nav.basic": "Basic",
  "nav.controlled": "Controlled",
  "nav.form": "Form",
  "nav.useCase": "Use Case",

  "basic.title": "Basic (Uncontrolled)",
  "basic.description":
    "useRefパターンでcirca-inputの値を取得する基本的な使い方です。",
  "basic.readValue": "値を読む",
  "basic.clear": "クリア",

  "controlled.title": "Controlled",
  "controlled.description":
    "useStateで値を管理し、リアルタイムに同期する制御モードです。",
  "controlled.reset": "リセット",

  "form.title": "Form Integration",
  "form.description":
    "name属性を設定すると、CircaValueがJSON文字列としてFormDataに含まれます。",
  "form.customerName": "顧客名",
  "form.customerNamePlaceholder": "山田太郎",
  "form.deliveryTime": "配達時間（9:00〜21:00）",
  "form.budget": "予算（0〜100,000円）",
  "form.submit": "送信",
  "form.reset": "リセット",
  "form.resultLabel": "送信結果（FormData）",

  "useCase.title": "Use Case: 配達時間",
  "useCase.description":
    "asymmetricモードで「早い方は30分前まで、遅い方は2時間後まで」のような非対称な許容範囲を表現できます。",
  "useCase.label": "配達希望時間:",
  "useCase.placeholder": "時間を選択してください",
  "useCase.approx": "約{center}（{from}〜{to}）",

  "common.unset": "未設定",

  "footer.text": "circa-input — 曖昧さをデータ化するUIプリミティブ",
};
