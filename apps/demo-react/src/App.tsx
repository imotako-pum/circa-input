import "./App.css";
import { BasicDemo } from "./sections/BasicDemo";
import { ControlledDemo } from "./sections/ControlledDemo";
import { FormDemo } from "./sections/FormDemo";
import { UseCaseDemo } from "./sections/UseCaseDemo";

export function App() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <h1>circa-input React Demo</h1>
          <p className="hero-subtitle">
            @circa-input/react パッケージの使い方デモ
          </p>
        </div>
      </header>

      <nav className="nav">
        <div className="container">
          <a href="#basic">Basic</a>
          <a href="#controlled">Controlled</a>
          <a href="#form">Form</a>
          <a href="#use-case">Use Case</a>
        </div>
      </nav>

      <main>
        <BasicDemo />
        <ControlledDemo />
        <FormDemo />
        <UseCaseDemo />
      </main>

      <footer className="footer">
        <div className="container">
          <p>circa-input &mdash; 曖昧さをデータ化するUIプリミティブ</p>
        </div>
      </footer>
    </>
  );
}
