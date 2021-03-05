export default function DataTable(props) {
  const { title, rows } = props;

  if (!rows || !rows.length) return;

  return (
    <div>
      <h2>{title}</h2>
      <table className="data-table">
        <tr>
          {Object.keys(rows[0]).map((col) => (col.toLowerCase() !== "location" ? <th key={col}>{col}</th> : null))}
        </tr>
        {rows.map((row) => {
          return (
            <tr key={row.location}>
              {Object.keys(row).map((key) => {
                if (key !== "site" && key !== "location") {
                  let className;
                  if (isNaN(new Date(row.date).getTime())) {
                    className = "bold";
                  }

                  return (
                    <td className={className} key={key}>
                      {row[key]}
                    </td>
                  );
                }

                return null;
              })}
            </tr>
          );
        })}
      </table>
    </div>
  );
}
