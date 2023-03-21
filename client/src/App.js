import { useEffect } from "react";
import GameEvents from "./components/GameEvents";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import { useGame } from "./contexts/GameContext";
import { useUserInterface } from "./contexts/UserInterfaceContext";
import Grid from "./components/Grid";

function App() {
  const { darkTheme } = useUserInterface();
  const { myTurn, loading, resetPlaneSelected } = useGame();

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
      // console.log("adios");
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={`main-container ${loading ? "body-loading" : ""} ${darkTheme ? "dark" : ""}`}>
      <Navbar />

      <GameEvents />

      {loading && <Loader />}

      {myTurn}
      <div className="grid-container">
        <Grid primary={true} />
        <Grid />
      </div>

      {/* <pre>{JSON.stringify(game, null, 2)}</pre> */}
    </div>
  );
}

export default App;
