import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GameProvider } from "./contexts/GameContext";
import { UserInterfaceProvider } from "./contexts/UserInterfaceContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <UserInterfaceProvider>
    <GameProvider>
      <App />
    </GameProvider>
  </UserInterfaceProvider>
);
