import React from "react";
import ActionsButtons from "./ActionsButtons";
import UserNotJoined from "./UserNotJoined";
import { useGame } from "../contexts/GameContext";
import Plane from "./Plane";

const ROWS = 10;

export default function Grid({ primary = false }) {
  const { game, myPlanes, myTurn, handleCellClick, opponentPlanes } = useGame();

  const handleCellOnClick = idx => {
    if (primary) return;
    handleCellClick(idx);
  };

  const generateCells = () => {
    const result = [];

    for (let i = 0; i < ROWS * ROWS; i++) {
      const hoverableClass = !primary ? "cell-hoverable" : "";
      const markerCol = i < ROWS ? <div className="marker marker-col">{i + 1}</div> : null;
      const markerRow =
        i % ROWS === 0 ? <div className="marker marker-row">{String.fromCharCode(65 + Math.floor(i / 10))}</div> : null;
      const mt = game.history.find(x => x.turn === myTurn && x.cell === i);
      const ot = game.history.find(x => x.turn === (myTurn + 1) % 2 && x.cell === i);

      const cell = (
        <div key={`cell-${i}`} className={`cell ${hoverableClass}`} onClick={() => handleCellOnClick(i)}>
          {markerCol}
          {markerRow}
          {!primary && mt && <div className={`${mt.status}`}></div>}
          {primary && ot && <div className={`${ot.status}`}></div>}
        </div>
      );

      result.push(cell);
    }

    return result;
  };

  return (
    <div className="grid-outer">
      <div className="grid">
        {generateCells()}
        {primary && myPlanes.map(p => <Plane key={p.id} plane={p} />)}
        {!primary && opponentPlanes.map(p => <Plane key={`opponent-${p.id}`} plane={p} />)}

        {/* {primary && game.player.planes.map(p => <Plane key={p.id} plane={p} />)}
        {!primary && game.opponent.planes.map(p => <Plane key={`opponent-${p.id}`} plane={p} />)}

        {!primary && !game.opponent.connected && <UserNotJoined />} */}

        {!primary && game.joinable && <UserNotJoined />}
      </div>

      {<ActionsButtons primary={primary} />}
    </div>
  );
}
