import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Make sure to use createRoot for React 18
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot ? ReactDOM.createRoot(rootElement) : null;

if (root) {
  // React 18
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // React 17 and below
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
    rootElement
  );
}