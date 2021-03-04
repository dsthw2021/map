export default function DataTable(props) {
  const { title, rows } = props;

  if (!rows || !rows.length) return;

  return (
    <div>
      <h2>{title}</h2>
      <table className="data-table">
        <tr>
          {Object.keys(rows[0]).map((col) => (
            <th>{col}</th>
          ))}
        </tr>
        {rows.map((row) => {
          return (
            <tr>
              {Object.keys(row).map((key) => {
                return key !== "site" && key !== "location" ? <td>{row[key]}</td> : null;
              })}
            </tr>
          );
        })}
      </table>
    </div>
  );
}
