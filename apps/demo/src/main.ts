// Web Componentを登録（import するだけでcustomElements.defineが実行される）
import "@circa-input/web-component";

// 各セクションの初期化
import { initAsymmetricSection } from "./sections/asymmetric";
import { initBasicSection } from "./sections/basic";
import { initFormSection } from "./sections/form";
import { initPlaygroundSection } from "./sections/playground";
import { initUseCasesSection } from "./sections/use-cases";

// DOMContentLoaded後に各セクションを初期化
document.addEventListener("DOMContentLoaded", () => {
  initBasicSection();
  initAsymmetricSection();
  initUseCasesSection();
  initPlaygroundSection();
  initFormSection();
});
