import React from "react";
import ActionsButtons from "./components/ActionsButtons";
import UserNotJoined from "./components/UserNotJoined";
import { useGame } from "./contexts/GameContext";
import Plane from "./Plane";
import "./style.css";

const ROWS = 10;
const CELL_SIZE = 2;

export default function Grid({ primary = false }) {
  const { game, handleCellClick } = useGame();

  const myTurns = game.history.filter(x => x.turn === game.turn);
  const opponentTurns = game.history.filter(x => x.turn !== game.turn);

  console.log("myTurns", myTurns);
  console.log("opponentTurns", opponentTurns);

  const cells = Array.from({ length: ROWS * ROWS }, (_, i) => (
    <div
      key={`cell-${i}`}
      className={`cell ${!primary ? "cell-hoverable" : ""}`}
      style={{ width: `${CELL_SIZE}rem`, height: `${CELL_SIZE}rem` }}
      onClick={() => handleCellClick({ row: Math.floor(i / 10), col: i % 10 })}
    >
      {i < ROWS && <div className="marker marker-col">{String.fromCharCode(65 + i)}</div>}
      {i % ROWS === 0 && <div className="marker marker-row">{Math.floor(i / ROWS) + 1}</div>}

      {primary && opponentTurns.find(x => x.row === Math.floor(i / 10) && x.col === i % 10) && (
        <div className={`${opponentTurns.find(x => x.row === Math.floor(i / 10) && x.col === i % 10).status}`}></div>
      )}

      {!primary && myTurns.find(x => x.row === Math.floor(i / 10) && x.col === i % 10) && (
        <div className={`${myTurns.find(x => x.row === Math.floor(i / 10) && x.col === i % 10).status}`}></div>
      )}
    </div>
  ));

  return (
    <div
      className="grid"
      style={{
        minWidth: `${CELL_SIZE * ROWS}rem`,
        width: `${CELL_SIZE * ROWS}rem`,
        minHeight: `${CELL_SIZE * ROWS}rem`,
        height: `${CELL_SIZE * ROWS}rem`,
      }}
      onContextMenu={e => e.preventDefault()}
    >
      {cells}

      {primary && game.player.planes.map(p => <Plane key={p.id} plane={p} />)}
      {!primary && game.opponent.planes.map(p => <Plane key={`opponent-${p.id}`} plane={p} />)}

      {!primary && !game.opponent.connected && <UserNotJoined />}

      {game.opponent.connected && <ActionsButtons primary={primary} />}
    </div>
  );
}
