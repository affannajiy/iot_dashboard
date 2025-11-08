import { getData } from "../data_fetcher/fetchdata";
import { useEffect, useState, useRef } from "react";
import Globe from "./Globe";
import Map from "./Map";

const Renderer = ({ render }) => {
  const [issLocation, setIssLocation] = useState(null);
  const intervalRef = useRef(null);
  useEffect(() => {
    const getIssData = async () => {
      const data = await getData();
      setIssLocation(data);
      console.log(`issLocation: ${JSON.stringify(data)}`);
    };
    getIssData();
    intervalRef.current = setInterval(getIssData, 2000); //fetches data every 2 second from the backend
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  if (render === "globe") {
    return (
      <section
        className="h-screen w-full flex justify-center items-center bg-yellow- font-jetbrains"
        key="globe"
      >
        {issLocation ? <Globe issLocation={issLocation} /> : <div>Loading</div>}
      </section>
    );
  }

  if (render === "map") {
    return (
      <section
        className="h-screen w-screen flex justify-center items-center bg-black font-jetbrains"
        key="map"
      >
        {issLocation ? <Map issLocation={issLocation} /> : <div>Loading</div>}
      </section>
    );
  }
  return (
    <>
      <section className="h-screen w-full flex justify-center items-center bg-black font-jetbrains">
        {render == "globe"}
        {issLocation ? (
          <div className="w-auto text-3xl text-white bg-green-600 h-auto">
            <div>Latitude: {issLocation.latitude}</div>
            <div>Longitude: {issLocation.longitude}</div>
            <div>Altitude: {issLocation.altitude}</div>
          </div>
        ) : (
          <div className="w-auto text-3xl text-white bg-red-600 h-auto">
            <p>loading</p>
          </div>
        )}
      </section>
    </>
  );
};

export default Renderer;
