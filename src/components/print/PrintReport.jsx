import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { DISEASE_BY_ID } from '../../data/diseases.js';
import { breakdown } from '../../utils/aggregate.js';
import { formatDate, formatDateTime, formatInt, formatPercent } from '../../utils/format.js';
import { RISK_LEVELS } from '../../utils/risk.js';

const th = 'border-b border-black/50 px-2 py-1 text-left font-semibold';
const td = 'border-b border-black/15 px-2 py-1 align-top';
const num = 'text-right tabular-nums';

function Table({ children }) {
  return <table className="w-full border-collapse text-[11px] leading-snug">{children}</table>;
}

/** Print-only situation report. Hidden on screen; the browser's print dialog can save it as a PDF. */
export default function PrintReport() {
  const { status, metricCards, countryRows, diseaseRows, outbreaks, alerts, meta, syncedAt } = useApp();
  const regions = useMemo(() => (outbreaks.length ? breakdown(outbreaks, (o) => countryRegion(o, countryRows), { days: 90 }) : []), [outbreaks, countryRows]);
  if (status !== 'ready') return null;

  const topCountries = countryRows.slice(0, 12);
  const keyAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').slice(0, 10);

  return (
    <div className="pulse-print-only bg-white p-0 text-[12px] text-black">
      <h1 className="text-2xl font-bold">PULSE-19 situation report</h1>
      <div className="mt-2 border-2 border-black px-3 py-2 text-[12px] font-semibold">
        SIMULATED DEMONSTRATION DATA. These figures are invented. They are not live, verified or suitable for medical, policy or operational decisions.
      </div>
      <p className="mt-2 text-[11px]">
        Data reference date: {formatDate(meta.referenceDate)}. Report generated: {formatDateTime(syncedAt)}. Source: {meta.label}.
      </p>

      <h2 className="mb-1 mt-5 text-sm font-bold">Headline indicators</h2>
      <Table>
        <thead>
          <tr>
            <th className={th}>Indicator</th>
            <th className={`${th} ${num}`}>Value</th>
            <th className={th}>Context</th>
            <th className={`${th} ${num}`}>Change</th>
          </tr>
        </thead>
        <tbody>
          {metricCards.map((m) => (
            <tr key={m.id}>
              <td className={td}>{m.label}</td>
              <td className={`${td} ${num}`}>{formatInt(m.value)}</td>
              <td className={td}>{m.detail}</td>
              <td className={`${td} ${num}`}>
                {formatPercent(m.delta.pct)} ({m.delta.label})
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-1 mt-5 text-sm font-bold">Highest-risk countries</h2>
      <Table>
        <thead>
          <tr>
            <th className={th}>Country</th>
            <th className={th}>Region</th>
            <th className={th}>Risk</th>
            <th className={`${th} ${num}`}>Active outbreaks</th>
            <th className={`${th} ${num}`}>Cases</th>
            <th className={`${th} ${num}`}>Fatalities</th>
            <th className={`${th} ${num}`}>30-day change</th>
            <th className={th}>Last reported</th>
          </tr>
        </thead>
        <tbody>
          {topCountries.map((r) => (
            <tr key={r.code}>
              <td className={td}>{r.name}</td>
              <td className={td}>{r.region}</td>
              <td className={td}>{RISK_LEVELS[r.risk.level].label}</td>
              <td className={`${td} ${num}`}>{r.activeOutbreaks}</td>
              <td className={`${td} ${num}`}>{formatInt(r.cases)}</td>
              <td className={`${td} ${num}`}>{formatInt(r.deaths)}</td>
              <td className={`${td} ${num}`}>{formatPercent(r.changePct)}</td>
              <td className={td}>{formatDate(r.lastReported)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-1 mt-5 text-sm font-bold">Diseases under monitoring</h2>
      <Table>
        <thead>
          <tr>
            <th className={th}>Disease</th>
            <th className={th}>Risk</th>
            <th className={`${th} ${num}`}>Active outbreaks</th>
            <th className={`${th} ${num}`}>Countries</th>
            <th className={`${th} ${num}`}>Cases</th>
            <th className={`${th} ${num}`}>Fatalities</th>
            <th className={th}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {diseaseRows.map((d) => (
            <tr key={d.id}>
              <td className={td}>{d.disease.name}</td>
              <td className={td}>{RISK_LEVELS[d.risk.level].label}</td>
              <td className={`${td} ${num}`}>{d.activeOutbreaks}</td>
              <td className={`${td} ${num}`}>{d.countries}</td>
              <td className={`${td} ${num}`}>{formatInt(d.cases)}</td>
              <td className={`${td} ${num}`}>{formatInt(d.deaths)}</td>
              <td className={td}>
                {d.trend} ({formatPercent(d.changePct)})
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-1 mt-5 text-sm font-bold">Regions, last 90 days</h2>
      <Table>
        <thead>
          <tr>
            <th className={th}>Region</th>
            <th className={`${th} ${num}`}>Cases</th>
            <th className={`${th} ${num}`}>Previous 90 days</th>
            <th className={`${th} ${num}`}>Change</th>
            <th className={`${th} ${num}`}>Active outbreaks</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.key}>
              <td className={td}>{r.key}</td>
              <td className={`${td} ${num}`}>{formatInt(r.cases)}</td>
              <td className={`${td} ${num}`}>{formatInt(r.previous)}</td>
              <td className={`${td} ${num}`}>{formatPercent(r.changePct)}</td>
              <td className={`${td} ${num}`}>{r.outbreaks}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-1 mt-5 text-sm font-bold">Critical and high-severity alerts</h2>
      <ul className="list-disc space-y-1 pl-5 text-[11px]">
        {keyAlerts.map((a) => (
          <li key={a.id}>
            <span className="font-semibold">[{RISK_LEVELS[a.severity].label}]</span> {a.title}. {a.body} ({formatDateTime(a.timestamp)})
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-black/40 pt-2 text-[10px]">
        PULSE-19 is a demonstration project. Country names, regions and approximate populations are static reference labels, and map boundaries come from Natural Earth. No verified real-world outbreak data is used. Diseases covered: {Object.values(DISEASE_BY_ID).map((d) => d.name).join(', ')}.
      </p>
    </div>
  );
}

function countryRegion(outbreak, countryRows) {
  return countryRows.find((r) => r.code === outbreak.countryCode)?.region ?? 'Unknown';
}
