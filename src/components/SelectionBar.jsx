// SelectionBar.jsx
import { useState } from "react";

const SelectionBar = ({ onDataReceived }) => {
  const [active, setActive] = useState("globe");

  const sendDataToParent = (mode) => {
    setActive(mode);
    console.log(`Render selected: ${mode}`);
    onDataReceived(mode);
  };

  return (
    <>
      <div
        className="
          fixed top-0 left-0 right-0 z-50
          bg-black/70 backdrop-blur-md
          border-b border-white/10
          font-jetbrains
        "
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-16 flex items-center justify-center">
            <div
              className="
                flex items-center
                rounded-xl p-1
                bg-white/5 border border-white/10
                shadow-sm
                w-[260px] sm:w-[320px]   /* total control width */
              "
            >
              <button
                onClick={() => sendDataToParent("globe")}
                className={`
                  flex-1 px-6 py-2 rounded-lg transition
                  text-center
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  ${active === "globe"
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-white/75 hover:text-white hover:bg-white/10"}
                `}
              >
                Globe
              </button>

              <button
                onClick={() => sendDataToParent("map")}
                className={`
                  flex-1 px-6 py-2 rounded-lg transition
                  text-center
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  ${active === "map"
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-white/75 hover:text-white hover:bg-white/10"}
                `}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectionBar;
