// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import { AuthProvider } from "@/contexts/AuthContext";
import { POSProvider } from "@/contexts/POSContext";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <POSProvider>
          <App />
          <Toaster />
        </POSProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
