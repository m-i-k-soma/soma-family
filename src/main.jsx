import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { EventProvider } from "./context/EventContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <EventProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </EventProvider>
    </AppProvider>
  </React.StrictMode>
);

