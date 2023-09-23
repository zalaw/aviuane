import React from "react";
import { GrEmoji } from "react-icons/gr";

import { useGame } from "../contexts/GameContext";

const EmotesMenu = () => {
  const { emotes, emotesToDisplay, handleSendEmote } = useGame();

  return (
    <>
      <div className="emotes-menu-container">
        <GrEmoji stroke={5} size={32} />

        <div className="emotes-menu">
          {emotes.map((emote, index) => (
            <div key={`${emote}-${index}`} className="emote" onClick={() => handleSendEmote(index)}>
              <img src={emote} alt="Emote" />
            </div>
          ))}
        </div>
      </div>

      <div className="emotes-to-display-container">
        {emotesToDisplay.map(emote => (
          <div key={emote.key} className="emote emote-animated" style={{ left: `${emote.left}%` }}>
            <img src={emotes[emote.index]} alt="emote" />
          </div>
        ))}
      </div>
    </>
  );
};

export default EmotesMenu;
