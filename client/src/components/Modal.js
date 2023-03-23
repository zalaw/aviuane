import React from "react";
import { MdClose } from "react-icons/md";

const Modal = ({ title = "", handleCloseModal, children }) => {
  return (
    <div className="modal">
      <div className="modal-body">
        <div className="modal-header">
          {title}
          <div onClick={handleCloseModal} className="modal-close">
            <MdClose />
          </div>
        </div>

        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
