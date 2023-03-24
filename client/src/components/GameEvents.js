import React from "react";
import { useGame } from "../contexts/GameContext";

const GameEvents = () => {
  const { game, myTurn, errorMessage } = useGame();

  return (
    <div className="game-events-container">
      {!game.started && game.players.length === 1 && (
        <p>
          Your code is <b>{game.code}</b>
        </p>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}

      {game.started && <p>{game.turn === myTurn ? "Your turn" : "Waiting for opponent"}</p>}
      {game.winner !== null && (
        <p>{game.winner === 2 ? "Tie" : game.winner === myTurn ? "GGEZ" : "Better luck next time"}</p>
      )}
    </div>
  );
};

export default GameEvents;
