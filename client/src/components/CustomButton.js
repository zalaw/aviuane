import React from "react";

const CustomButton = ({ text, cn = "", tooltip, icon, disabled = false, onClick }) => {
  return (
    <div className="button-container btn">
      <button
        disabled={disabled}
        className={`custom-button ${cn} ${!text && icon ? "with-only-icon" : ""}`}
        onClick={onClick}
      >
        {icon && <div className="button-icon btn">{icon}</div>}
        {text}
      </button>
      {tooltip && <div className="button-tooltip btn">{tooltip}</div>}
    </div>
  );
};

export default CustomButton;
