import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom/";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <CookiesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CookiesProvider>
  </React.StrictMode>
);
