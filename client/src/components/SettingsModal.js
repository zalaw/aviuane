import React, { useState } from "react";
import { useUserInterface } from "../contexts/UserInterfaceContext";
import Modal from "./Modal";
import CustomButton from "./CustomButton";
import { useGame } from "../contexts/GameContext";

const SettingsModal = () => {
  const { toggleShowSettingsModal } = useUserInterface();
  const { game, handleSettingsChange } = useGame();

  const [gridSize, setGridSize] = useState(game.gridSize);
  const [numOfPlanes, setNumOfPlanes] = useState(game.numOfPlanes);

  const getBackgroundSize = (val, min, max) => {
    return { backgroundSize: `${((val - min) * 100) / (max - min)}% 100%` };
  };

  const handleGridSizeChange = e => {
    const max = getMaxNumOfPlanes(e.target.valueAsNumber);

    setGridSize(e.target.valueAsNumber);

    if (numOfPlanes > max) {
      setNumOfPlanes(max);
    }
  };

  const handleSave = () => {
    handleSettingsChange({ gridSize, numOfPlanes });
    toggleShowSettingsModal();
  };

  const getMaxNumOfPlanes = input => {
    if (input <= 7) return 2;
    if (input >= 8 && input <= 10) return 4;
    if (input >= 11 && input <= 13) return 6;
    return 8;
  };

  return (
    <Modal title="Settings" handleCloseModal={toggleShowSettingsModal}>
      <div className="settings-row">
        <h2>Grid size</h2>
        <p>
          {gridSize}x{gridSize}
        </p>
        <input
          min="8"
          max="15"
          type="range"
          value={gridSize}
          onChange={handleGridSizeChange}
          style={getBackgroundSize(gridSize, 8, 15)}
        />
      </div>

      <div className="settings-row">
        <h2>Number of planes</h2>
        <p>{numOfPlanes}</p>
        <input
          min="2"
          max={getMaxNumOfPlanes(gridSize)}
          type="range"
          value={numOfPlanes}
          onChange={e => setNumOfPlanes(e.target.valueAsNumber)}
          style={getBackgroundSize(numOfPlanes, 2, getMaxNumOfPlanes(gridSize))}
        />
      </div>

      <CustomButton
        // icon={game.players[myTurn].ready ? <MdCheck /> : <MdClose />}
        // cn={game.players[myTurn].ready ? "ready" : "not-ready"}
        // disabled={game.players[myTurn].planes.some(x => !x.valid)}
        // disabled={myPlanes.some(x => !x.valid)}
        // onClick={handleToggleReady}
        cn="settings-button"
        text="Save"
        onClick={handleSave}
      />
    </Modal>
  );
};

export default SettingsModal;
