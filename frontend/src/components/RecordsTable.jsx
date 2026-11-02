export default function RecordsTable({ headers, rows, emptyMessage }) {
  if (!rows.length) return <p className="message">{emptyMessage}</p>;

  return (
    <section className="content-card table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{formatValue(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
