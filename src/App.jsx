import Renderer from "./components/Renderer";
import Globe from "./components/Globe";
import Map from "./components/Map";
import SelectionBar from "./components/SelectionBar";
import Stats from "./components/StatsGlobe";

import { useState, useRef } from "react";

function App() {
  const [renderObject, setrenderObject] = useState("globe");

  const handleSelection = (data) => {
    setrenderObject(data);
  };

  return (
    <>
      <SelectionBar onDataReceived={handleSelection} />
      <Renderer render={renderObject} />
    </>
  );
}

export default App;
