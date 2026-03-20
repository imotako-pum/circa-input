import type { Translations } from "./types";

export const ja: Translations = {
  "hero.title": "circa-input React Demo",
  "hero.subtitle": "@circa-input/react パッケージの使い方デモ",

  "nav.basic": "Basic",
  "nav.controlled": "Controlled",
  "nav.gradient": "\u30B0\u30E9\u30C7\u30FC\u30B7\u30E7\u30F3",
  "nav.rangeOnly": "\u30EC\u30F3\u30B8\u30AA\u30F3\u30EA\u30FC",
  "nav.form": "Form",
  "nav.useCases": "Use Cases",

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

  "gradient.title": "\u30B0\u30E9\u30C7\u30FC\u30B7\u30E7\u30F3",
  "gradient.description":
    "gradient\u30D7\u30ED\u30C3\u30D7\u3067\u30DE\u30FC\u30B8\u30F3\u9818\u57DF\u306B\u78BA\u4FE1\u5EA6\u306E\u30B0\u30E9\u30C7\u30FC\u30B7\u30E7\u30F3\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002relative\u3068absolute\u3092\u6BD4\u8F03\u3057\u3066\u307F\u307E\u3057\u3087\u3046\u3002",
  "gradient.relative": "relative",
  "gradient.absolute": "absolute",
  "gradient.intensityLabel": "\u5F37\u5EA6",

  "rangeOnly.title": "\u30EC\u30F3\u30B8\u30AA\u30F3\u30EA\u30FC",
  "rangeOnly.description":
    "rangeOnly\u30D7\u30ED\u30C3\u30D7\u3067\u4E2D\u5FC3\u5024\u306E\u30CF\u30F3\u30C9\u30EB\u304C\u975E\u8868\u793A\u306B\u306A\u308A\u3001\u30EC\u30F3\u30B8\u30D0\u30FC\u306E\u307F\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002\u7BC4\u56F2\u305D\u306E\u3082\u306E\u3092\u6307\u5B9A\u3057\u305F\u3044\u5834\u5408\u306B\u4FBF\u5229\u3067\u3059\u3002",
  "rangeOnly.normal": "\u901A\u5E38\u30E2\u30FC\u30C9",
  "rangeOnly.rangeOnly":
    "\u30EC\u30F3\u30B8\u30AA\u30F3\u30EA\u30FC\u30E2\u30FC\u30C9",

  "useCases.title": "\u30E6\u30FC\u30B9\u30B1\u30FC\u30B9",
  "useCases.description":
    "circa-input\u306F\u69D8\u3005\u306A\u5834\u9762\u3067\u300C\u3060\u3044\u305F\u3044\u306E\u5024\u300D\u3092\u5165\u529B\u3059\u308B\u306E\u306B\u4F7F\u3048\u307E\u3059\u3002",
  "useCases.time.title": "\u914D\u9054\u6642\u9593",
  "useCases.time.description":
    "\u5E0C\u671B\u3059\u308B\u914D\u9054\u6642\u9593\u5E2F\u3092\u6307\u5B9A",
  "useCases.budget.title": "\u4E88\u7B97",
  "useCases.budget.description":
    "\u3060\u3044\u305F\u3044\u306E\u4E88\u7B97\u611F\u3092\u5165\u529B",
  "useCases.temp.title": "\u6C17\u6E29",
  "useCases.temp.description":
    "\u5FEB\u9069\u306B\u611F\u3058\u308B\u6C17\u6E29\u306E\u7BC4\u56F2",
  "useCases.age.title": "\u5E74\u9F62\u5C64",
  "useCases.age.description":
    "\u30BF\u30FC\u30B2\u30C3\u30C8\u3068\u306A\u308B\u5E74\u9F62\u5C64\u3092\u6307\u5B9A",
  "useCases.meeting.title": "\u4F1A\u8B70\u6642\u9593",
  "useCases.meeting.description":
    "\u4F1A\u8B70\u306E\u6240\u8981\u6642\u9593\u306E\u898B\u7A4D\u3082\u308A",
  "useCases.commute.title": "\u901A\u52E4\u8DDD\u96E2",
  "useCases.commute.description": "\u901A\u52E4\u8DDD\u96E2\u306E\u7BC4\u56F2",

  "format.yearsUnit": "\u6B73",
  "format.range": "{low} \u301C {high}",

  "common.unset": "未設定",

  "footer.text": "circa-input — 曖昧さをデータ化するUIプリミティブ",
};
