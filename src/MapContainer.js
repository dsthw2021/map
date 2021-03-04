// import react from "react";
import { useState, useEffect } from "react";
import { Map, InfoWindow, GoogleApiWrapper, Polygon } from "google-maps-react";
import Tabletop from "tabletop";
import InfoTable from "./InfoTable";
import DataTable from "./DataTable";

export function titleCase(str) {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
}

function MapContainer(props) {
  const { google } = props;

  const [data, setData] = useState({});
  const [polygons, setPolygons] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [activeLocation, setActiveLocation] = useState("");
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);

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
    // TODO: calculate the "center" of the polygon instead of returning a corner of it
    return paths[0];
  }

  return (
    <Map google={google} zoom={14} onClick={onMapClicked}>
      {Object.keys(polygons).map((key) => {
        return (
          <Polygon
            key={key}
            paths={polygons[key]}
            onClick={(polygon) => {
              setActiveLocation(key);
              onPolygonClick(polygon);
            }}
          />
        );
      })}
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
  );
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBoaMwtEv26-QexJ0Zge-FhO08jVdYTioQ",
})(MapContainer);
