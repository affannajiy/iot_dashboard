// Map.jsx
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import StatsMap from "./StatsMap";

function RecenterOnISS({ lat, lng, zoom = 3 }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], map.getZoom() ?? zoom, { duration: 0.7 });
    }
  }, [lat, lng, map, zoom]);
  return null;
}

export default function Map({ issLocation }) {
  const lat = Number(issLocation?.latitude ?? 0);
  const lng = Number(issLocation?.longitude ?? 0);
  const alt = Number(issLocation?.altitude ?? 0);
  const vel = Number(issLocation?.velocity ?? 0);

  return (
    // leave space for fixed SelectionBar
    <div className="absolute inset-0 pt-16 flex flex-col">
      {/* Top half: map */}
      <div className="h-1/2 w-full">
        <MapContainer
          center={[0, 0]}
          zoom={3}
          minZoom={2}
          maxZoom={8}
          scrollWheelZoom
          worldCopyJump
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issLocation && (
            <>
              <CircleMarker
                center={[lat, lng]}
                radius={6}
                pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 1 }}
              >
                <Popup>
                  <div className="font-jetbrains text-sm">
                    <div><b>ISS</b></div>
                    <div>Lat: {lat.toFixed(4)}°</div>
                    <div>Lng: {lng.toFixed(4)}°</div>
                    <div>Alt: {alt.toFixed(1)} km</div>
                    <div>Vel: {vel.toFixed(1)} km/h</div>
                  </div>
                </Popup>
              </CircleMarker>
              <RecenterOnISS lat={lat} lng={lng} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Bottom half: frosted stats panel */}
      <div className="h-1/2 w-full">
        <StatsMap iss={issLocation} />
      </div>
    </div>
  );
}
