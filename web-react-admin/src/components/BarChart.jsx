/* Plain div/width-percentage bar chart — no charting library.
   Ports renderBarChart() from admin/admin.js exactly:
   sort entries by count desc, width = count/max*100%. */

export default function BarChart({ counts, labelMap = {}, emptyMessage }) {
  const entries = Object.entries(counts || {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="empty-note">{emptyMessage}</p>;
  }

  const max = Math.max(...entries.map((e) => e[1]), 1);

  return (
    <div className="bar-chart">
      {entries.map(([key, count]) => {
        const label = labelMap[key] || key;
        return (
          <div className="bar-row" key={key}>
            <span className="bar-label" title={label}>{label}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="bar-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
