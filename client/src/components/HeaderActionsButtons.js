import React from "react";
import { useGame } from "../contexts/GameContext";
import CustomButton from "./CustomButton";
import { MdKeyboardBackspace } from "react-icons/md";

const HeaderActionsButtons = ({ primary }) => {
  const { game, handleLeave } = useGame();

  return (
    <div className="actions-buttons-container" style={{ paddingBottom: "2rem" }}>
      {!game.joinable && (
        <div className="row">
          <div className="row-item" style={{ visibility: primary ? "visible" : "hidden" }}>
            <CustomButton tooltip="Leave" text={"Leave"} icon={<MdKeyboardBackspace />} onClick={handleLeave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderActionsButtons;
