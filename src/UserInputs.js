import { useState } from "react";
export default function UserInputs(props) {
  const {
    showPolygon,
    showCircle,
    date,
    metric,
    onChangeShowMap,
    onChangeShowCircle,
    onChangeDate,
    onChangeMetric,
    dateOptions,
    metricOptions,
  } = props;

  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <div className="user-inputs">
        <button onClick={() => setHidden(false)}>More Options</button>
      </div>
    );
  }

  return (
    <div className="user-inputs">
      <button onClick={() => setHidden(true)}>Hide</button>
      <div className="user-input-section">
        <div className="user-input-label">
          <label>Show Map Area:</label>
        </div>
        <input
          type="checkbox"
          id="show-map"
          name="show-map"
          checked={showPolygon}
          value={showPolygon}
          onChange={onChangeShowMap}
        />
      </div>

      <div className="user-input-section">
        <div className="user-input-label">
          <label>Date:</label>
        </div>
        <select value={date} onChange={onChangeDate}>
          <option disabled selected value>
            -- select an option --
          </option>
          {dateOptions.map((el) => {
            return (
              <option key={el.date} value={el.date}>
                {el.date}
              </option>
            );
          })}
        </select>
      </div>
      <div className="user-input-section">
        <div className="user-input-label">
          <label>Metric:</label>
        </div>
        <select value={metric} onChange={onChangeMetric}>
          <option disabled selected value>
            -- select an option --
          </option>
          {metricOptions.map((key) => {
            return key !== "date" && key !== "location" ? (
              <option key={key} value={key}>
                {key}
              </option>
            ) : null;
          })}
        </select>
      </div>
      {date && metric ? (
        <div className="user-input-section">
          <div className="user-input-label">
            <label>Show Circles:</label>
          </div>
          <input
            type="checkbox"
            id="show-circle"
            name="show-circle"
            checked={showCircle}
            value={showCircle}
            onChange={onChangeShowCircle}
          />
        </div>
      ) : null}
    </div>
  );
}
