import React, { useEffect, useRef } from "react";
import { useGame } from "./contexts/GameContext";
import Plane from "./Plane";
import "./style.css";

export default function Grid({ primary = false }) {
  const {
    player,
    opponent,
    joinRoom,
    handleToggleReady,
    turn,
    gameStarted,
    handleCellClick,
    history,
    opponentPlanes,
    gameOver,
    handleTogglePlayAgain,
  } = useGame();

  const inputRef = useRef(null);

  const cells = Array.from({ length: 100 }, (_, i) => (
    <div
      key={`cell-${i}`}
      className={`cell ${!primary && "cell-hoverable"}`}
      onClick={() => handleCellClick({ row: Math.floor(i / 10), col: i % 10 })}
    >
      {i < 10 && <div className="marker marker-col">{String.fromCharCode(65 + i)}</div>}
      {i % 10 === 0 && <div className="marker marker-row">{Math.floor(i / 10) + 1}</div>}
      {primary && history?.find(x => x.turn !== turn && x.row === Math.floor(i / 10) && x.col === i % 10) && (
        <div
          className={history?.find(x => x.turn !== turn && x.row === Math.floor(i / 10) && x.col === i % 10).status}
        ></div>
      )}
      {!primary && history?.find(x => x.turn === turn && x.row === Math.floor(i / 10) && x.col === i % 10) && (
        <div
          className={history?.find(x => x.turn === turn && x.row === Math.floor(i / 10) && x.col === i % 10).status}
        ></div>
      )}
    </div>
  ));

  return (
    <div className="grid">
      {cells}

      {!primary && opponentPlanes.map(plane => <Plane key={plane.id} plane={plane} />)}

      {primary && player?.planes?.map(plane => <Plane key={plane.id} plane={plane} />)}

      {!primary && !opponent && (
        <div className="join-by-code">
          <input ref={inputRef} maxLength={4} type="text" placeholder="Your friend's code" />
          <input type="button" value="Join" onClick={() => joinRoom(inputRef.current.value)} />
        </div>
      )}

      {!gameStarted && primary && opponent && (
        <div className="ready-container">
          <div className={player.ready ? "ready" : "not-ready"}></div>
          <button disabled={!player.planes.every(x => x.valid)} className="btn-ready" onClick={handleToggleReady}>
            Ready
          </button>
        </div>
      )}

      {!gameStarted && !primary && opponent && (
        <div className="ready-container">
          <div className={opponent.ready ? "ready" : "not-ready"}></div>
          Opponent
        </div>
      )}

      {gameOver && primary && (
        <div className="ready-container">
          <div className={player.playAgain ? "ready" : "not-ready"}></div>
          <button className="btn-ready" onClick={handleTogglePlayAgain}>
            Play again
          </button>
        </div>
      )}

      {gameOver && !primary && (
        <div className="ready-container">
          <div className={opponent.playAgain ? "ready" : "not-ready"}></div>
          Opponent
        </div>
      )}
    </div>
  );
}
