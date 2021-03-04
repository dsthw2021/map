// import react from "react";
import { useState, useEffect } from "react";
import { Map, InfoWindow, GoogleApiWrapper, Polygon, Circle } from "google-maps-react";
import Tabletop from "tabletop";
import InfoTable from "./InfoTable";
import DataTable from "./DataTable";
import UserInputs from "./UserInputs";

export function titleCase(str) {
  const words = str.toLowerCase().split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = titleCaseWithSlash(words[i]);
  }

  return words.join(" ");
}

function titleCaseWithSlash(str) {
  const words = str.toLowerCase().split("/");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }

  return words.join("/");
}

function MapContainer(props) {
  const { google } = props;

  const [data, setData] = useState({});
  const [polygons, setPolygons] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [activeLocation, setActiveLocation] = useState("");
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [date, setDate] = useState(null);
  const [metric, setMetric] = useState(null);
  const [showPolygon, setShowPolygon] = useState(true);
  const [showCircle, setShowCircle] = useState(false);
  const [circleRadii, setCircleRadii] = useState({});

  function processData(spreadsheetData) {
    const dirtData = {};
    const polygonData = {};
    const descriptions = {};

    // loop through each tab and process according if it's a data or map-area tab
    for (const tabName in spreadsheetData) {
      if (tabName.includes("(Data)")) {
        const location = spreadsheetData[tabName].elements[0].location;

        const filteredElements = spreadsheetData[tabName].elements.filter((el) => {
          const date = new Date(el.date).getTime();
          const today = new Date().getTime();
          // filter for dates within past 90 days, units are in ms
          return today - date < 90 * 24 * 60 * 60 * 1000;
        });

        dirtData[location] = filteredElements;
      } else if (tabName === "Map Coordinates") {
        spreadsheetData[tabName].elements.forEach((row) => {
          const { location, lat, lng } = row;

          const locationPolygon = polygonData[location];
          if (!locationPolygon) {
            polygonData[location] = [];
          }
          polygonData[row.location].push({
            lat,
            lng,
          });
        });
      } else if (tabName === "Descriptions") {
        spreadsheetData[tabName].elements.forEach((row) => {
          descriptions[row.location] = row;
        });
      }
    }
    setDescriptions(descriptions);
    setPolygons(polygonData);
    setData(dirtData);
  }

  useEffect(() => {
    Tabletop.init({
      key: "https://docs.google.com/spreadsheets/d/19Za-wgC1G_-TcFNm3j7iMpbmbF9P-PoaA_qKKhyRQCs/pubhtml",
      parseNumbers: true,
      callback: processData,
    });
  }, []);

  function onInfoWindowClose() {
    setShowInfoWindow(false);
    setActiveLocation("");
  }

  function onMapClicked() {
    if (showInfoWindow) {
      onInfoWindowClose();
    }
    setShowInfoWindow(false);
    setInfoWindowPosition(null);
    setActiveLocation("");
  }

  function onPolygonClick(polygon) {
    setInfoWindowPosition(getPolygonPosition(polygon.paths));
    setShowInfoWindow(true);
  }

  function getPolygonPosition(paths) {
    let bounds = new google.maps.LatLngBounds();
    const latLngPaths = paths.map((path) => new google.maps.LatLng(path.lat, path.lng));

    for (let i = 0; i < latLngPaths.length; i++) {
      bounds.extend(latLngPaths[i]);
    }

    return bounds.getCenter();
  }

  function calculateCircleRadii(circleDate, circleMetric) {
    if (!circleDate || !circleMetric) return {};

    const metrics = {};
    Object.keys(data).forEach((location) => {
      metrics[location] = data[location].find((row) => {
        return row.date === circleDate;
      })[circleMetric];
    });

    const totalRadii = 1500;
    const total = Object.values(metrics).reduce((a, c) => a + c);

    const newRadii = {};
    for (const location in metrics) {
      newRadii[location] = {
        value: metrics[location],
        radii: total ? Math.floor(parseFloat(metrics[location] / total) * totalRadii) : 0,
      };
    }

    setCircleRadii(newRadii);
  }

  return (
    <div>
      <UserInputs
        showPolygon={showPolygon}
        showCircle={showCircle}
        date={date}
        metric={metric}
        onChangeShowMap={() => setShowPolygon(!showPolygon)}
        onChangeShowCircle={() => setShowCircle(!showCircle)}
        onChangeDate={(e) => {
          setDate(e.target.value);
          calculateCircleRadii(e.target.value, metric);
        }}
        onChangeMetric={(e) => {
          setMetric(e.target.value);
          calculateCircleRadii(date, e.target.value);
        }}
        dateOptions={data[Object.keys(data)[0]] ? data[Object.keys(data)[0]] : []}
        metricOptions={Object.keys(data).length ? Object.keys(data[Object.keys(data)[0]][0]) : []}
      />

      <Map google={google} zoom={14} onClick={onMapClicked}>
        {showPolygon
          ? Object.keys(polygons).map((key) => {
              let color;

              if (descriptions[key].team === "Market") {
                color = "orange";
              } else if (descriptions[key].team === "Mission") {
                color = "lightgreen";
              }

              return (
                <Polygon
                  key={key}
                  paths={polygons[key]}
                  strokeColor={color}
                  strokeOpacity={0.35}
                  strokeWeight={2}
                  fillColor={color}
                  fillOpacity={0.35}
                  onClick={(polygon) => {
                    setActiveLocation(key);
                    onPolygonClick(polygon);
                  }}
                />
              );
            })
          : null}
        {showCircle
          ? Object.keys(polygons).map((key) => {
              let color;

              if (descriptions[key].team === "Market") {
                color = "red";
              } else if (descriptions[key].team === "Mission") {
                color = "blue";
              }

              return (
                <Circle
                  key={key}
                  radius={circleRadii[key] ? circleRadii[key].radii : 0}
                  center={getPolygonPosition(polygons[key])}
                  strokeColor={color}
                  strokeOpacity={0}
                  strokeWeight={5}
                  fillColor={color}
                  fillOpacity={0.6}
                />
              );
            })
          : null}
        {activeLocation ? (
          <InfoWindow position={infoWindowPosition} visible={showInfoWindow} onClose={onInfoWindowClose}>
            <div className="info-window">
              <h1>{titleCase(activeLocation)}</h1>
              <InfoTable name={activeLocation} info={descriptions[activeLocation]} />
              <DataTable title="Past 90 Days" rows={data[activeLocation]} />
            </div>
          </InfoWindow>
        ) : null}
      </Map>
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBoaMwtEv26-QexJ0Zge-FhO08jVdYTioQ",
})(MapContainer);
