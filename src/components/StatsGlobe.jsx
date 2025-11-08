// StatsGlobe.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

function fmtNum(n, digits = 3) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
}

const BUFFER_CAPACITY = 180; // at 2s polling ≈ 6 minutes

export default function StatsGlobe({ iss }) {
  const ts = iss?.timestamp ? new Date(iss.timestamp * 1000) : null;

  // rolling buffer for sparkline: [{ t, dAlt }]
  const [series, setSeries] = useState([]);
  const prevRef = useRef(null); // { alt, tsSec }
  const lastTsRef = useRef(null);

  useEffect(() => {
    if (!iss) return;

    const alt = Number(iss.altitude);
    const tsSec = Number(iss.timestamp); // seconds from backend

    if (lastTsRef.current === tsSec) return; // skip duplicate ticks

    // compute dAlt (km per sample)
    let dAlt = null;
    if (prevRef.current && prevRef.current.tsSec !== tsSec) {
      dAlt = alt - prevRef.current.alt;
    }

    prevRef.current = { alt, tsSec };
    lastTsRef.current = tsSec;

    setSeries((prev) => {
      const next = [...prev, { t: tsSec * 1000, dAlt }];
      if (next.length > BUFFER_CAPACITY) next.shift();
      return next;
    });
  }, [iss]);

  return (
    <aside
      className="
        fixed left-0 top-0 bottom-0 z-50
        w-72 sm:w-80
        bg-black/70 backdrop-blur-md
        border-r border-white/10
        text-white
        p-4 sm:p-5
        overflow-y-auto
        font-jetbrains
      "
    >
      <h2 className="text-xl font-semibold mb-3">ISS Tracker</h2>

      {!iss ? (
        <div className="text-white/70">Loading…</div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div className="text-white/60">Latitude</div>
            <div className="font-mono">{fmtNum(iss.latitude, 4)}°</div>

            <div className="text-white/60">Longitude</div>
            <div className="font-mono">{fmtNum(iss.longitude, 4)}°</div>

            <div className="text-white/60">Altitude</div>
            <div className="font-mono">{fmtNum(iss.altitude, 2)} km</div>

            <div className="text-white/60">Velocity</div>
            <div className="font-mono">{fmtNum(iss.velocity, 1)} km/h</div>
          </div>

          <div className="h-px bg-white/10 my-2" />

          {/* Δ Altitude sparkline */}
          <div>
            <div className="text-xs text-white/60 mb-1">Δ Altitude (per sample)</div>
            <div className="w-full h-20 rounded-lg border border-white/10 bg-white/5 px-2">
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={series} margin={{ top: 10, right: 6, left: 6, bottom: 6 }}>
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <ReferenceLine y={0} stroke="#ffffff" strokeOpacity={0.25} />
                  <Line
                    type="monotone"
                    dataKey="dAlt"
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    formatter={(v) =>
                      v == null ? "—" : `${Number(v).toFixed(3)} km`
                    }
                    labelFormatter={() => ""}
                    contentStyle={{
                      background: "rgba(0,0,0,0.75)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-px bg-white/10 my-2" />

          <div className="text-xs text-white/60">
            <div>
              Timestamp: <span className="font-mono">{iss.timestamp ?? "—"}</span>
            </div>
            <div>
              Local time:{" "}
              <span className="font-mono">
                {ts ? ts.toLocaleString() : "—"}
              </span>
            </div>
            <div>
              Fetched at (UTC):{" "}
              <span className="font-mono">{iss.fetched_at ?? "—"}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
