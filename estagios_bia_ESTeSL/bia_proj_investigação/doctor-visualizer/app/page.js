"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
  "Mid-stance",
  "Terminal Stance",
  "Pre-swing",
  "Toe-off",
  "Mid-swing",
  "Terminal Swing",
];

const DEFAULT_PATIENT = {
  id: "PT-2026-041",
  name: "Maria Almeida",
  age: 67,
  diagnosis: "Post-op orthopedic follow-up",
  date: "2026-04-26",
};

const DEFAULT_PHASE_DATA = {
  Hip: {
    "Initial Contact": { Baseline: 7.8, Before: 5, After: 6 },
    "Mid-stance": { Baseline: -3.7, Before: 4, After: -1 },
    "Terminal Stance": { Baseline: -15.4, Before: -10, After: -12 },
    "Pre-swing": { Baseline: -15.2, Before: -9, After: -13 },
    "Toe-off": { Baseline: -7.5, Before: -3, After: -6 },
    "Mid-swing": { Baseline: 5.7, Before: 10, After: 5 },
    "Terminal Swing": { Baseline: 7.3, Before: 11, After: 10 },
  },
  Knee: {
    "Initial Contact": { Baseline: 5, Before: 2, After: 4 },
    "Mid-stance": { Baseline: 12, Before: 7, After: 10 },
    "Terminal Stance": { Baseline: 8, Before: 4, After: 6 },
    "Pre-swing": { Baseline: 35, Before: 28, After: 32 },
    "Toe-off": { Baseline: 50, Before: 40, After: 46 },
    "Mid-swing": { Baseline: 62, Before: 52, After: 58 },
    "Terminal Swing": { Baseline: 10, Before: 6, After: 8 },
  },
  Ankle: {
    "Initial Contact": { Baseline: 0, Before: -4, After: -2 },
    "Mid-stance": { Baseline: 5, Before: 1, After: 3 },
    "Terminal Stance": { Baseline: 10, Before: 5, After: 8 },
    "Pre-swing": { Baseline: -8, Before: -12, After: -10 },
    "Toe-off": { Baseline: -15, Before: -20, After: -17 },
    "Mid-swing": { Baseline: -2, Before: -7, After: -4 },
    "Terminal Swing": { Baseline: 0, Before: -5, After: -2 },
  },
};

const COLORS = {
  Baseline: "#2A9D8F",
  Before: "#E76F51",
  After: "#1D3557",
};

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

  const calculateImprovement = (rows) => {
    const totalBeforeGap = rows.reduce((sum, row) => sum + Math.abs(row.Baseline - row.Before), 0);
    const totalAfterGap = rows.reduce((sum, row) => sum + Math.abs(row.Baseline - row.After), 0);

    if (!totalBeforeGap) {
      return 0;
    }

    return ((totalBeforeGap - totalAfterGap) / totalBeforeGap) * 100;
  };

  const sectionChartData = useMemo(() => {
    const result = {};
    SECTIONS.forEach((section) => {
      result[section] = PHASES.map((phase) => ({
        phase,
        ...phaseData[section][phase],
      }));
    });
    return result;
  }, [phaseData]);

  const sectionImprovementScores = useMemo(() => {
    const scores = {};
    SECTIONS.forEach((section) => {
      scores[section] = calculateImprovement(sectionChartData[section]);
    });
    return scores;
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
            Doctors can register measurements, compare baseline versus pre and post intervention,
            and immediately visualize trends in a publication-ready style.
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
          <small>Higher values mean closer to baseline after intervention</small>
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
              Patient ID
              <input
                type="text"
                value={patient.id}
                onChange={(event) => setPatient({ ...patient, id: event.target.value })}
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
                Baseline is fixed. Edit Before and After values to compare treatment progression.
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
                    <th>Baseline</th>
                    <th>Before</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  {PHASES.map((phase) => (
                    <tr key={`${section}-${phase}`}>
                      <td>{phase}</td>
                      <td>
                        <NumberInput
                          step={0.1}
                          value={phaseData[section][phase].Baseline}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <NumberInput
                          step={0.1}
                          value={phaseData[section][phase].Before}
                          onChange={(value) => updatePhaseValue(section, phase, "Before", value)}
                        />
                      </td>
                      <td>
                        <NumberInput
                          step={0.1}
                          value={phaseData[section][phase].After}
                          onChange={(value) => updatePhaseValue(section, phase, "After", value)}
                        />
                      </td>
                    </tr>
                  ))}
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
                      name="Baseline"
                      dataKey="Baseline"
                      stroke={COLORS.Baseline}
                      fill={COLORS.Baseline}
                      fillOpacity={0.14}
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
              <h3>{section} Gait Phases</h3>
              <p className="subtle">Line profile across all gait phases.</p>
              <div className="chart-wrap chart-wrap-large">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={sectionChartData[section]}
                    margin={{ top: 10, right: 30, left: 15, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="2 6" stroke="#d8dbe2" />
                    <XAxis
                      dataKey="phase"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={75}
                      stroke="#1f2937"
                    />
                    <YAxis stroke="#1f2937" unit="°" />
                    <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #ccd3df" }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Baseline"
                      stroke={COLORS.Baseline}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Before"
                      stroke={COLORS.Before}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="After"
                      stroke={COLORS.After}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
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
