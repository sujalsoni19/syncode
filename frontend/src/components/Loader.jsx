import React from "react";
import { TailSpin } from "react-loader-spinner";

function Loader({height="80"}) {
  return (
    <div>
      <TailSpin color="#34D399" height={height}/>
    </div>
  );
}

export default Loader;
