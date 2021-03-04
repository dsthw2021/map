import { titleCase } from "./MapContainer";

export default function InfoTable(props) {
  const { name, info } = props;

  return (
    <table className="info-table">
      <tr>
        <td className="bold">Name</td>
        <td>{titleCase(name)}</td>
      </tr>
      {!!info &&
        Object.keys(info)
          .filter((k) => k.toLowerCase() !== "location")
          .map((key) => {
            return (
              <tr key={key}>
                <td className="bold">{titleCase(key)}</td>
                <td>{info[key]}</td>
              </tr>
            );
          })}
    </table>
  );
}
