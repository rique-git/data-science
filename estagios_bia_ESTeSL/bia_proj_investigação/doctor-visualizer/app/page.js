"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const SECTIONS = ["Hip", "Knee", "Ankle"];
const PHASES = [
  "Initial Contact",
  "Loading Response",
  "Mid-stance",
  "Terminal Stance",
  "Pre-swing",
  "Initial Swing",
  "Mid-swing",
  "Terminal Swing",
];

// Position of each phase along the gait cycle (%) — see reference Hip plot.
const PHASE_X = {
  "Initial Contact": 0,
  "Loading Response": 12,
  "Mid-stance": 31,
  "Terminal Stance": 50,
  "Pre-swing": 62,
  "Initial Swing": 75,
  "Mid-swing": 87,
  "Terminal Swing": 100,
};

const PHASE_ABBR = {
  "Initial Contact": "IC",
  "Loading Response": "LR",
  "Mid-stance": "MSt",
  "Terminal Stance": "TSt",
  "Pre-swing": "PSw",
  "Initial Swing": "ISw",
  "Mid-swing": "MSw",
  "Terminal Swing": "TSw",
};

// Top-axis phase bands. The shaded ones are the double-support periods.
const PHASE_REGIONS = [
  { abbr: "LR", start: 0, end: 12, shaded: true },
  { abbr: "MSt", start: 12, end: 31 },
  { abbr: "TSt", start: 31, end: 50 },
  { abbr: "PSw", start: 50, end: 62, shaded: true },
  { abbr: "ISw", start: 62, end: 75 },
  { abbr: "MSw", start: 75, end: 87 },
  { abbr: "TSw", start: 87, end: 100 },
];

const X_TICKS = [0, 12, 31, 50, 62, 75, 87, 100];

// Standard ranges from literature (Folha2 – angulos-pacientes.xlsx)
const STANDARD_RANGES = {
  Hip: {
    "Initial Contact": { min: 25,  max: 35 },
    "Loading Response": { min: 26, max: 36 },
    "Mid-stance":      { min: 12,  max: 22 },
    "Terminal Stance": { min: -10, max: 0  },
    "Pre-swing":       { min: -11, max: -1 },
    "Initial Swing":   { min: 10,  max: 20 },
    "Mid-swing":       { min: 30,  max: 40 },
    "Terminal Swing":  { min: 25,  max: 35 },
  },
  // Knee values taken from reference image 3 (Excel ignored), ±5° band.
  Knee: {
    "Initial Contact": { min: 0,  max: 10 },
    "Loading Response": { min: 13, max: 23 },
    "Mid-stance":      { min: 5,  max: 15 },
    "Terminal Stance": { min: 0,  max: 10 },
    "Pre-swing":       { min: 33, max: 43 },
    "Initial Swing":   { min: 52, max: 62 },
    "Mid-swing":       { min: 25, max: 35 },
    "Terminal Swing":  { min: 0,  max: 10 },
  },
  // Ankle values taken from reference image (Excel ignored), ±5° band.
  Ankle: {
    "Initial Contact": { min: -5,  max: 5   },
    "Loading Response": { min: -10, max: 0  },
    "Mid-stance":      { min: 0,   max: 10  },
    "Terminal Stance": { min: 5,   max: 15  },
    "Pre-swing":       { min: -24, max: -14 },
    "Initial Swing":   { min: -12, max: -2  },
    "Mid-swing":       { min: -6,  max: 4   },
    "Terminal Swing":  { min: -7,  max: 3   },
  },
};

const DEFAULT_PATIENT = {
  name: "Maria Almeida",
  age: 67,
  weight: 68,
  height: 162,
  diagnosis: "Post-op orthopedic follow-up",
  date: "2026-04-26",
};

const DEFAULT_PHASE_DATA = {
  Hip: {
    "Initial Contact": { Before: 24,    After: 22.4 },
    "Loading Response": { Before: 23.6, After: 17.2 },
    "Mid-stance":      { Before: 13.3,  After: 5.8  },
    "Terminal Stance": { Before: -10.7, After: -6.1 },
    "Pre-swing":       { Before: -4.3,  After: -3.8 },
    "Initial Swing":   { Before: 2.1,   After: 1.6  },
    "Mid-swing":       { Before: 17.8,  After: 22.6 },
    "Terminal Swing":  { Before: 24.2,  After: 30.5 },
  },
  Knee: {
    "Initial Contact": { Before: 8.2,  After: 8    },
    "Loading Response": { Before: 19.4, After: 15.1 },
    "Mid-stance":      { Before: 24.2, After: 20.3 },
    "Terminal Stance": { Before: 8.6,  After: 4.2  },
    "Pre-swing":       { Before: 43.7, After: 41.2 },
    "Initial Swing":   { Before: 62.4, After: 53.9 },
    "Mid-swing":       { Before: 53.8, After: 51.3 },
    "Terminal Swing":  { Before: 3.2,  After: 1.9  },
  },
  Ankle: {
    "Initial Contact": { Before: -3,  After: -1  },
    "Loading Response": { Before: -8, After: -6  },
    "Mid-stance":      { Before: 2,   After: 4   },
    "Terminal Stance": { Before: 6,   After: 8   },
    "Pre-swing":       { Before: -14, After: -17 },
    "Initial Swing":   { Before: -12, After: -9  },
    "Mid-swing":       { Before: -4,  After: -2  },
    "Terminal Swing":  { Before: -5,  After: -3  },
  },
};

const COLORS = {
  NormalRange: "#6366f1",
  Before: "#E76F51",
  After: "#1D3557",
};

function formatRange(min, max) {
  if (min === max) return `${min}°`;
  return `${min}° a ${max}°`;
}

function NumberInput({ value, onChange, step = 1, disabled = false }) {
  return (
    <input
      className="num-input"
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={disabled}
    />
  );
}

export default function Page() {
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [phaseData, setPhaseData] = useState(DEFAULT_PHASE_DATA);

  const calculateImprovement = (rows, section) => {
    const totalBeforeGap = rows.reduce((sum, row) => {
      const { min, max } = STANDARD_RANGES[section][row.phase];
      const mid = (min + max) / 2;
      return sum + Math.abs(mid - row.Before);
    }, 0);
    const totalAfterGap = rows.reduce((sum, row) => {
      const { min, max } = STANDARD_RANGES[section][row.phase];
      const mid = (min + max) / 2;
      return sum + Math.abs(mid - row.After);
    }, 0);
    if (!totalBeforeGap) return 0;
    return ((totalBeforeGap - totalAfterGap) / totalBeforeGap) * 100;
  };

  const sectionChartData = useMemo(() => {
    const result = {};
    SECTIONS.forEach((section) => {
      result[section] = PHASES.map((phase) => {
        const { min, max } = STANDARD_RANGES[section][phase];
        return {
          phase,
          x: PHASE_X[phase],
          ...phaseData[section][phase],
          normalRange: [min, max],
          normalMin: min,
          normalMax: max,
        };
      });
    });
    return result;
  }, [phaseData]);

  const sectionImprovementScores = useMemo(() => {
    const scores = {};
    SECTIONS.forEach((section) => {
      scores[section] = calculateImprovement(sectionChartData[section], section);
    });
    return scores;
  }, [sectionChartData]);

  // Round Y-axis to whole 10° steps (0, 10, 20, ...) per joint.
  const sectionYAxis = useMemo(() => {
    const config = {};
    SECTIONS.forEach((section) => {
      let lo = Infinity;
      let hi = -Infinity;
      sectionChartData[section].forEach((d) => {
        lo = Math.min(lo, d.normalMin, d.Before, d.After);
        hi = Math.max(hi, d.normalMax, d.Before, d.After);
      });
      const min = Math.floor(lo / 10) * 10;
      const max = Math.ceil(hi / 10) * 10;
      const ticks = [];
      for (let t = min; t <= max; t += 10) ticks.push(t);
      config[section] = { domain: [min, max], ticks };
    });
    return config;
  }, [sectionChartData]);

  const updatePhaseValue = (section, phase, condition, value) => {
    setPhaseData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [phase]: {
          ...current[section][phase],
          [condition]: value,
        },
      },
    }));
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero panel">
        <div>
          <p className="kicker">Clinical Dashboard</p>
          <h1>Patient Gait and Joint Angle Explorer</h1>
          <p>
            Doctors can register measurements, compare standard range versus pre and post
            intervention, and immediately visualize trends in a publication-ready style.
          </p>
        </div>
        <div className="score-card">
          <span>Phase Improvement by Region</span>
          <div className="score-list">
            {SECTIONS.map((section) => (
              <div key={`score-${section}`} className="score-row">
                <span>{section}</span>
                <strong>{sectionImprovementScores[section].toFixed(1)}%</strong>
              </div>
            ))}
          </div>
          <small>Higher values mean closer to standard range after intervention</small>
        </div>
      </section>

      <section className="grid-layout">
        <article className="panel form-panel full-width">
          <h2>Patient Record</h2>
          <div className="patient-grid">
            <label>
              Name
              <input
                type="text"
                value={patient.name}
                onChange={(event) => setPatient({ ...patient, name: event.target.value })}
              />
            </label>
            <label>
              Age
              <input
                type="number"
                value={patient.age}
                onChange={(event) => setPatient({ ...patient, age: Number(event.target.value) })}
              />
            </label>
            <label>
              Weight (kg)
              <input
                type="number"
                step={0.1}
                value={patient.weight}
                onChange={(event) => setPatient({ ...patient, weight: Number(event.target.value) })}
              />
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                step={0.1}
                value={patient.height}
                onChange={(event) => setPatient({ ...patient, height: Number(event.target.value) })}
              />
            </label>
            <label>
              Assessment Date
              <input
                type="date"
                value={patient.date}
                onChange={(event) => setPatient({ ...patient, date: event.target.value })}
              />
            </label>
            <label className="wide">
              Clinical Note
              <input
                type="text"
                value={patient.diagnosis}
                onChange={(event) => setPatient({ ...patient, diagnosis: event.target.value })}
              />
            </label>
          </div>
        </article>
      </section>

      {SECTIONS.map((section) => (
        <section key={section} className="phase-section">
          <div className="section-header">
            <div>
              <h2>{section} Analysis</h2>
              <p>
                Normal range from literature. Edit Before and After values to compare treatment
                progression.
              </p>
            </div>
            <div className="section-improvement">
              <span>{section} Improvement</span>
              <strong>{sectionImprovementScores[section].toFixed(1)}%</strong>
            </div>
          </div>

          <section className="grid-layout">
            <article className="panel table-panel">
              <h3>{section} Phase Inputs (degrees)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Normal Range</th>
                    <th>Before</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  {PHASES.map((phase) => {
                    const { min, max } = STANDARD_RANGES[section][phase];
                    return (
                      <tr key={`${section}-${phase}`}>
                        <td>{phase}</td>
                        <td>
                          <span className="range-badge">{formatRange(min, max)}</span>
                        </td>
                        <td>
                          <NumberInput
                            step={0.1}
                            value={phaseData[section][phase].Before}
                            onChange={(value) =>
                              updatePhaseValue(section, phase, "Before", value)
                            }
                          />
                        </td>
                        <td>
                          <NumberInput
                            step={0.1}
                            value={phaseData[section][phase].After}
                            onChange={(value) =>
                              updatePhaseValue(section, phase, "After", value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>

            <article className="panel chart-panel">
              <h3>{section} Profile Radar</h3>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={sectionChartData[section]}>
                    <PolarGrid stroke="#cad2df" />
                    <PolarAngleAxis dataKey="phase" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                    <Radar
                      name="Normal Min"
                      dataKey="normalMin"
                      stroke={COLORS.NormalRange}
                      fill={COLORS.NormalRange}
                      fillOpacity={0.08}
                      strokeDasharray="4 3"
                      legendType="none"
                    />
                    <Radar
                      name="Normal Range"
                      dataKey="normalMax"
                      stroke={COLORS.NormalRange}
                      fill={COLORS.NormalRange}
                      fillOpacity={0.15}
                      strokeDasharray="4 3"
                    />
                    <Radar
                      name="Before"
                      dataKey="Before"
                      stroke={COLORS.Before}
                      fill={COLORS.Before}
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="After"
                      dataKey="After"
                      stroke={COLORS.After}
                      fill={COLORS.After}
                      fillOpacity={0.22}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel chart-panel full-width">
              <h3>{section} Gait Cycle</h3>
              <p className="subtle">
                Motion across the gait cycle. Dashed lines = normal range boundaries.
                Grey columns mark the double-support phases.
              </p>
              <div className="chart-wrap chart-wrap-large">
                <ResponsiveContainer width="100%" height={380}>
                  <ComposedChart
                    data={sectionChartData[section]}
                    margin={{ top: 48, right: 24, left: 10, bottom: 36 }}
                  >
                    <CartesianGrid strokeDasharray="2 6" stroke="#d8dbe2" />

                    {/* Phase bands + labels along the top, like the reference plot */}
                    {PHASE_REGIONS.map((region) => (
                      <ReferenceArea
                        key={`${section}-${region.abbr}`}
                        x1={region.start}
                        x2={region.end}
                        fill={region.shaded ? "#9ca3af" : "transparent"}
                        fillOpacity={region.shaded ? 0.18 : 0}
                        stroke="none"
                        ifOverflow="extendDomain"
                        label={{
                          value: region.abbr,
                          position: "insideTop",
                          fontSize: 11,
                          fill: "#33485f",
                        }}
                      />
                    ))}
                    {/* Vertical separators between phases */}
                    {X_TICKS.map((tick) => (
                      <ReferenceLine
                        key={`${section}-sep-${tick}`}
                        x={tick}
                        stroke="#c3ccd9"
                        strokeWidth={1}
                      />
                    ))}
                    {/* Zero baseline */}
                    <ReferenceLine y={0} stroke="#9aa4b2" strokeWidth={1} />
                    {/* Movement-direction labels (ankle): dorsiflexion over MSt,
                        plantar flexion over TSt, as in the reference */}
                    {section === "Ankle" && (
                      <>
                        <ReferenceArea
                          x1={12}
                          x2={31}
                          y1={8}
                          y2={16}
                          fill="transparent"
                          stroke="none"
                          label={{
                            value: "Dorsiflexion",
                            fontSize: 11,
                            fill: "#6b7280",
                            fontStyle: "italic",
                          }}
                        />
                        <ReferenceArea
                          x1={31}
                          x2={50}
                          y1={-16}
                          y2={-8}
                          fill="transparent"
                          stroke="none"
                          label={{
                            value: "Plantar Flexion",
                            fontSize: 11,
                            fill: "#6b7280",
                            fontStyle: "italic",
                          }}
                        />
                      </>
                    )}

                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={[0, 100]}
                      ticks={X_TICKS}
                      tickFormatter={(value) => `${value}`}
                      stroke="#1f2937"
                      label={{ value: "Gait Cycle %", position: "insideBottom", offset: -14 }}
                    />
                    <YAxis
                      stroke="#1f2937"
                      unit="°"
                      domain={sectionYAxis[section].domain}
                      ticks={sectionYAxis[section].ticks}
                      allowDecimals={false}
                      label={{ value: "Motion (degrees)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 14, border: "1px solid #ccd3df" }}
                      labelFormatter={(value, payload) =>
                        payload && payload.length ? payload[0].payload.phase : `${value}%`
                      }
                    />
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 10 }} />

                    {/* Normal-range envelope */}
                    <Area
                      type="natural"
                      dataKey="normalRange"
                      fill={COLORS.NormalRange}
                      fillOpacity={0.14}
                      stroke="none"
                      name="Normal Range"
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="natural"
                      dataKey="normalMin"
                      stroke={COLORS.NormalRange}
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />
                    <Line
                      type="natural"
                      dataKey="normalMax"
                      stroke={COLORS.NormalRange}
                      strokeWidth={1}
                      strokeDasharray="4 3"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />

                    {/* Patient curves */}
                    <Line
                      type="natural"
                      dataKey="Before"
                      name="Before"
                      stroke={COLORS.Before}
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="natural"
                      dataKey="After"
                      name="After"
                      stroke={COLORS.After}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </section>
      ))}

      <footer className="page-footer">
        <p>
          Copyright © {new Date().getFullYear()} Clinical Motion Dashboard. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
