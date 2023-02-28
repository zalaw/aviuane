import React from "react";
import { useGame } from "../contexts/GameContext";

const ActionsButtons = ({ primary }) => {
  const { game, handleToggleReady, handleTogglePlayAgain } = useGame();

  return (
    <div>
      {game.started ? null : primary ? (
        <div className="ready-container">
          <div className={game.player.ready ? "ready" : "not-ready"}></div>
          <button disabled={!game.player.planes.every(x => x.valid)} className="btn-ready" onClick={handleToggleReady}>
            Ready
          </button>
        </div>
      ) : (
        <div className="ready-container">
          <div className={game.opponent.ready ? "ready" : "not-ready"}></div>
          Opponent
        </div>
      )}

      {!game.finished ? null : primary ? (
        <div className="ready-container">
          <div className={game.player.playAgain ? "ready" : "not-ready"}></div>
          <button className="btn-ready" onClick={handleTogglePlayAgain}>
            Play again
          </button>
        </div>
      ) : (
        <div className="ready-container">
          <div className={game.opponent.playAgain ? "ready" : "not-ready"}></div>
          Opponent
        </div>
      )}
    </div>
  );
};

export default ActionsButtons;
