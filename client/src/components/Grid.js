import React from "react";
import ActionsButtons from "./ActionsButtons";
import UserNotJoined from "./UserNotJoined";
import { useGame } from "../contexts/GameContext";
import Plane from "./Plane";
import HeaderActionsButtons from "./HeaderActionsButtons";

export default function Grid({ primary = false }) {
  const { game, myPlanes, myTurn, handleCellClick, opponentPlanes } = useGame();

  const handleCellOnClick = idx => {
    if (primary) return;
    handleCellClick(idx);
  };

  const generateCells = () => {
    const result = [];

    for (let i = 0; i < game.gridSize * game.gridSize; i++) {
      const hoverableClass = !primary ? "cell-hoverable" : "";
      const markerCol = i < game.gridSize ? <div className="marker marker-col">{i + 1}</div> : null;
      const markerRow =
        i % game.gridSize === 0 ? (
          <div className="marker marker-row">{String.fromCharCode(65 + Math.floor(i / game.gridSize))}</div>
        ) : null;
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

  const gridStyle = {
    width: `${game.gridSize * 2}rem`,
    height: `${game.gridSize * 2}rem`,
    minWidth: `${game.gridSize * 2}rem`,
    minHeight: `${game.gridSize * 2}rem`,
  };

  return (
    <div className="grid-outer">
      <HeaderActionsButtons primary={primary} />

      <div className="grid" style={gridStyle}>
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
