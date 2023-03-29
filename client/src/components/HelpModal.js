import React from "react";
import { useUserInterface } from "../contexts/UserInterfaceContext";
import Modal from "./Modal";

const HelpModal = () => {
  const { toggleShowHelpModal } = useUserInterface();

  return (
    <Modal title="How to play" handleCloseModal={toggleShowHelpModal}>
      <p>Welcome to Aviuane!</p>
      <p>Your goal is to destroy all of your opponent's airplanes before they destroy yours. The game is turn-based.</p>
      <p>
        You can move your planes by dragging them and you can rotate them by right-clicking them or using the buttons
        below your grid after the desired plane is selected.
      </p>
      <p>Here's what symbols mean:</p>
      <div className="list">
        <div className="list-item">
          <div className="cell">
            <div className="miss"></div>
          </div>
          <p>This is a miss</p>
        </div>

        <div className="list-item">
          <div className="cell">
            <div className="hit"></div>
          </div>
          <p>This is a hit</p>
        </div>

        <div className="list-item">
          <div className="cell">
            <div className="head-hit"></div>
          </div>
          <p>This is a head hit. The airplane is destroyed</p>
        </div>
      </div>
      <p>Remember, any hit on an airplane that has already been destroyed will be rendered as a miss.</p>
    </Modal>
  );
};

export default HelpModal;
