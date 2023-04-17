import React, { createContext, useContext, useEffect, useState } from "react";

const UserInterfaceContext = createContext();

export function useUserInterface() {
  return useContext(UserInterfaceContext);
}

export function UserInterfaceProvider({ children }) {
  const [darkTheme, setDarkTheme] = useState();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  function toggleDarkTheme() {
    setDarkTheme(prev => {
      localStorage.setItem("AVIUANE_DARK_THEME", !prev);
      return !prev;
    });
  }

  function toggleShowHelpModal() {
    setShowHelpModal(curr => !curr);
  }

  function toggleShowSettingsModal() {
    setShowSettingsModal(curr => !curr);
  }

  useEffect(() => {
    setDarkTheme(localStorage.getItem("AVIUANE_DARK_THEME") === "true");
  }, []);

  const value = {
    darkTheme,
    showHelpModal,
    showSettingsModal,
    toggleDarkTheme,
    toggleShowHelpModal,
    toggleShowSettingsModal,
  };

  return <UserInterfaceContext.Provider value={value}>{children}</UserInterfaceContext.Provider>;
}
