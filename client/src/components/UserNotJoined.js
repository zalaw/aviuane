import React, { useState } from "react";
import { useGame } from "../contexts/GameContext";

const UserNotJoined = () => {
  const { handleJoin } = useGame();

  const [inputValue, setInputValue] = useState("");

  return (
    <div className="user-not-joined-container">
      <input type="text" placeholder="Your friend's code" maxLength={4} onChange={e => setInputValue(e.target.value)} />
      <button onClick={() => handleJoin(inputValue)} disabled={inputValue.length !== 4}>
        Join
      </button>
    </div>
  );
};

export default UserNotJoined;
