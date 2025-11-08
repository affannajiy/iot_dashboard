// StatsMap.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

function fmt(n, d = 3) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
}

const BUFFER_CAPACITY = 180; // ~6 min at 2s polling

export default function StatsMap({ iss }) {
  const ts = iss?.timestamp ? new Date(iss.timestamp * 1000) : null;

  // ==== Δ Altitude buffer (km per sample) ====
  const [series, setSeries] = useState([]); // [{ t, dAlt }]
  const prevRef = useRef(null);            // { alt, tsSec }
  const lastTsRef = useRef(null);

  useEffect(() => {
    if (!iss) return;
    const alt = Number(iss.altitude);
    const tsSec = Number(iss.timestamp);
    if (!Number.isFinite(alt) || !Number.isFinite(tsSec)) return;
    if (lastTsRef.current === tsSec) return; // ignore duplicate tick

    let dAlt = null;
    if (prevRef.current && prevRef.current.tsSec !== tsSec) {
      dAlt = alt - prevRef.current.alt; // km per sample
    }

    prevRef.current = { alt, tsSec };
    lastTsRef.current = tsSec;

    setSeries((prev) => {
      const next = [...prev, { t: tsSec * 1000, dAlt }];
      if (next.length > BUFFER_CAPACITY) next.shift();
      return next;
    });
  }, [iss]);

  // --- Terminal: rotating facts ---
  const baseFacts = useMemo(
    () => [
      "The ISS orbits Earth ~15–16 times per day.",
      "The first ISS module (Zarya) launched in 1998.",
      "The ISS travels ~28,000 km/h relative to Earth’s surface.",
      "Solar arrays on the ISS span ~73 meters tip-to-tip.",
      "Crew see a sunrise/sunset about every 45 minutes.",
      "Microgravity research on the ISS spans biology to materials.",
      "The ISS is a partnership between NASA, Roscosmos, ESA, JAXA, and CSA.",
      "Atmospheric drag slowly lowers ISS altitude—reboosts are needed.",
      "The cupola’s 7 windows give astronauts panoramic Earth views.",
      "ISS mass is ~420,000 kg (about a fully loaded 747).",
    ],
    []
  );

  const liveFacts = useMemo(() => {
    if (!iss) return [];
    const lat = fmt(iss.latitude, 2);
    const lng = fmt(iss.longitude, 2);
    const alt = fmt(iss.altitude, 1);
    const vel = fmt(iss.velocity, 0);
    return [`Live: Lat ${lat}°, Lng ${lng}° | Alt ${alt} km | Vel ${vel} km/h`];
  }, [iss]);

  const facts = useMemo(() => [...liveFacts, ...baseFacts], [liveFacts, baseFacts]);

  const [factIdx, setFactIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!facts.length) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setFactIdx((i) => (i + 1) % facts.length);
    }, 3500);
    return () => clearInterval(id);
  }, [facts.length]);

  return (
    <section
      className="
        h-full w-full
        bg-black/70 backdrop-blur-md
        border-t border-white/10
        text-white font-jetbrains
        px-4 sm:px-6 py-4
        overflow-y-auto
      "
    >
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-lg sm:text-xl font-semibold tracking-wide">
          International Space Station
        </div>
        <span className="text-xs px-2 py-1 rounded bg-green-300/20 border border-white/10">
          On Orbit
        </span>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <div className="text-white/60">Latitude</div>
        <div className="font-mono">{fmt(iss?.latitude, 4)}°</div>

        <div className="text-white/60">Longitude</div>
        <div className="font-mono">{fmt(iss?.longitude, 4)}°</div>

        <div className="text-white/60">Altitude</div>
        <div className="font-mono">{fmt(iss?.altitude, 2)} km</div>

        <div className="text-white/60">Velocity</div>
        <div className="font-mono">{fmt(iss?.velocity, 1)} km/h</div>
      </div>

      <div className="h-px bg-white/10 my-4" />

      {/* Δ Altitude sparkline */}
      <div>
        <div className="text-xs text-white/60 mb-1">Δ Altitude (per sample)</div>
        <div className="w-full h-[88px] rounded-lg border border-white/10 bg-white/5 px-2">
          <ResponsiveContainer width="100%" height={88}>
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
                formatter={(v) => (v == null ? "—" : `${Number(v).toFixed(3)} km`)}
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

      <div className="h-px bg-white/10 my-4" />

      {/* Time */}
      <div className="text-xs text-white/60 space-y-1 mb-3">
        <div>Timestamp: <span className="font-mono">{iss?.timestamp ?? "—"}</span></div>
        <div>Local time: <span className="font-mono">{ts ? ts.toLocaleString() : "—"}</span></div>
        <div>Fetched at (UTC): <span className="font-mono">{iss?.fetched_at ?? "—"}</span></div>
      </div>

      {/* Terminal / ticker */}
      <div
        className="
          mt-2 rounded-lg border border-white/10 bg-black/50
          font-mono text-[13px] leading-relaxed
          p-3 sm:p-4
        "
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <div className="text-white/60 mb-2">/var/log/iss — live feed</div>
        <div
          className="
            whitespace-pre-wrap
            bg-white/5 rounded p-3
            border border-white/10
            min-h-13
            transition-opacity duration-300
          "
          key={factIdx}
        >
{`$ ${facts[factIdx] || "Waiting for telemetry..."}`}
        </div>
        <div className="mt-2 text-white/40 text-xs">
          Hover to pause • Updates every ~3.5s
        </div>
      </div>
    </section>
  );
}
