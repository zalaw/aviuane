import { useEffect } from "react";
import GameEvents from "./components/GameEvents";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import { useGame } from "./contexts/GameContext";
import { useUserInterface } from "./contexts/UserInterfaceContext";
import Grid from "./components/Grid";
import HelpModal from "./components/HelpModal";
import SettingsModal from "./components/SettingsModal";

function App() {
  const { darkTheme, showHelpModal, showSettingsModal } = useUserInterface();
  const { game, myTurn, loading, resetPlaneSelected } = useGame();

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        !e.target.classList.contains("plane-piece") &&
        !e.target.classList.contains("rotate-btn") &&
        !e.target.classList.contains("plane")
      ) {
        resetPlaneSelected();
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={`main-container ${loading ? "body-loading" : ""} ${darkTheme ? "dark" : ""} ${
        game.players.some(x => x.disconnected)
          ? ""
          : game.started && myTurn === game.turn
          ? "my-turn"
          : game.started && myTurn !== game.turn
          ? "opponents-turn"
          : ""
      }`}
    >
      {showHelpModal && <HelpModal />}
      {showSettingsModal && <SettingsModal />}

      <Navbar />

      <GameEvents />

      {loading && <Loader />}

      <div className="grid-container" onContextMenu={e => e.preventDefault()}>
        <Grid primary={true} />
        <Grid />
      </div>

      {/* <pre>{JSON.stringify(game, null, 2)}</pre> */}
    </div>
  );
}

export default App;
