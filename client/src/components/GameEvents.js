import React from "react";
import { useGame } from "../contexts/GameContext";

const GameEvents = () => {
  const { game } = useGame();

  return (
    <div className="game-events-container">
      {!game.started && !game.opponent.connected && (
        <p>
          Your code is <b>{game.code}</b>
        </p>
      )}

      {game.message.content && <p className={`${game.message.error ? "error" : ""}`}>{game.message.content}</p>}

      {game.opponent.connected && (
        <p>
          {game.started && game.finished
            ? game.winner === game.turn
              ? "GGEZ"
              : "Better luck next time"
            : !game.started
            ? null
            : game.turn === game.now
            ? "Your turn"
            : "Waiting for opponent"}
        </p>
      )}
    </div>
  );
};

export default GameEvents;
