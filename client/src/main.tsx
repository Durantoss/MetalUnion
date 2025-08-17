import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppWrapper from "./AppWrapper";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <AppWrapper />
    </ErrorBoundary>
  );
} else {
  console.error("Root element not found!");
}
