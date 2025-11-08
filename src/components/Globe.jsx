// Globe.jsx
import R3fGlobe from "r3f-globe";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo } from "react";
import StatsGlobe from "./StatsGlobe";

const EARTH_RADIUS_KM = 6371;

const GlobeViz = ({ issLocation }) => {
  // Build a single "particle" for ISS
  const issPoint = useMemo(() => {
    if (!issLocation) return [];
    const lat = Number(issLocation.latitude);
    const lng = Number(issLocation.longitude);
    const altKm = Number(issLocation.altitude); // km from your backend
    const altRatio = Math.max(0, altKm / EARTH_RADIUS_KM); // e.g. 430/6371 ≈ 0.0675

    return [
      {
        lat,
        lng,
        altRatio, // store altitude ratio for accessor
        color: "orange",
        size: 0.5, // sprite size (not altitude)
        label: "ISS", // optional: for tooltips/labels
        __iss: true,
      },
    ];
  }, [issLocation]);

  return (
    <R3fGlobe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      /* --- ISS as a single particle --- */
      pointsData={issPoint}
      pointAltitude={(p) => p.altRatio} // altitude as R ratio
      pointColor={(p) => (p.__iss ? p.color : "#fff")}
      pointRadius={(p) => p.size} // visual radius of the sprite
      pointLabel={(p) => p.label} // tooltip on hover (optional)
      // Some builds also expose:
      // pointResolution={12} // makes the dot rounder (optional)
      pointResolution={20}
      pointsTransitionDuration={0}
      /* --- If you also want a floating label (optional) --- */
      labelsData={issPoint}
      labelsTransitionDuration={0}
      labelText={(p) => p.label}
      labelColor={() => "orange"}
      labelSize={() => 1.5}
      labelAltitude={(p) => p.altRatio} // keep label at same altitude
    />
  );
};

const Globe = ({ issLocation }) => (
  <div className="h-screen w-screen relative">
    <StatsGlobe iss={issLocation} />
    <Canvas flat camera={{ fov: 50, position: [0, 0, 350] }}>
      {/* Starry background */}
      <Stars
        radius={200} // how far the stars are
        depth={80} // z-range of stars
        count={20000} // number of stars
        factor={4} // size factor
        saturation={0} // 0 = white
        fade // fade out at the edges
        speed={3.0} // subtle twinkle
      />
      <OrbitControls
        minDistance={101}
        maxDistance={1e4}
        dampingFactor={0.1}
        zoomSpeed={0.3}
        rotateSpeed={0.3}
      />
      <color attach="background" args={[0, 0, 0]} />
      <ambientLight intensity={Math.PI} />
      <directionalLight intensity={0.6 * Math.PI} />
      <GlobeViz issLocation={issLocation} />
    </Canvas>
  </div>
);

export default Globe;
