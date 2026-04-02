import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { StudyProvider } from "./context/StudyContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StudyProvider>
      <App />
      <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />
    </StudyProvider>
  </BrowserRouter>
);