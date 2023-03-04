import React from "react";

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader-center">
        <div className={`plane N plane-loader`}>
          <div className="plane-piece head h1"></div>
          <div className="plane-piece big-wing bw1"></div>
          <div className="plane-piece big-wing bw2"></div>
          <div className="plane-piece big-wing bw3"></div>
          <div className="plane-piece big-wing bw4"></div>
          <div className="plane-piece big-wing bw5"></div>
          <div className="plane-piece body b1"></div>
          <div className="plane-piece small-wing sw1"></div>
          <div className="plane-piece small-wing sw2"></div>
          <div className="plane-piece small-wing sw3"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
