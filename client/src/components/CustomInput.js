import React from "react";

const CustomInput = ({ type = "text", placeholder, maxLength, onChange }) => {
  return (
    <input className="custom-input" type={type} maxLength={maxLength} onChange={onChange} placeholder={placeholder} />
  );
};

export default CustomInput;
