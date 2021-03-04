// import react from "react";
import { useState, useEffect } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polygon } from "google-maps-react";
import Tabletop from "tabletop";

function MapContainer(props) {
  const { google } = props;

  const [data, setData] = useState({});
  const [polygons, setPolygons] = useState({});

  function processData(spreadsheetData) {
    const dirtData = {};
    const polygonData = {};

    // loop through each tab and process according if it's a data or map-area tab
    for (const tabName in spreadsheetData) {
      const location = spreadsheetData[tabName].elements[0].location;

      if (tabName.includes("data-")) {
        dirtData[location] = spreadsheetData[tabName].elements;
      } else if (tabName.includes("map-area-")) {
        const locationPolygon = polygonData[location];
        if (!locationPolygon) {
          polygonData[location] = [];
        }

        spreadsheetData[tabName].elements.forEach((row) => {
          polygonData[row.location].push({
            lat: row.lat,
            lng: row.lng,
          });
        });
      }
    }

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

  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [activePolygon, setActivePolygon] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);

  function onMarkerClick() {
    setShowInfoWindow(!showInfoWindow);
    console.log("clicked");
  }

  function onInfoWindowClose() {
    setShowInfoWindow(false);
  }

  function onMapClicked() {
    if (showInfoWindow) {
      onInfoWindowClose();
    }
    setShowInfoWindow(false);
    setInfoWindowPosition(null);
    setActivePolygon(null);
  }

  function onPolygonClick(polygon) {
    setActivePolygon(polygon);
    setInfoWindowPosition(getPolygonPosition(polygon.paths));
    setShowInfoWindow(true);
  }

  function getPolygonPosition(paths) {
    // TODO: calculate the "center" of the polygon instead of returning a corner of it
    return paths[0];
  }

  return (
    <Map google={google} zoom={14} onClick={onMapClicked}>
      <Marker onClick={onMarkerClick} name={"Current location"} />
      {Object.keys(polygons).map((key) => {
        console.log("mapping", key, polygons[key]);
        return <Polygon key={key} paths={polygons[key]} onClick={onPolygonClick} />;
      })}
      <InfoWindow position={infoWindowPosition} visible={showInfoWindow} onOpen={() => console.log("opened")} onClose={onInfoWindowClose}>
        <div style={{ backgroundColor: "red", minWidth: "200", minHeight: "200" }}>
          <h1>hi</h1>
        </div>
      </InfoWindow>
    </Map>
  );
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBoaMwtEv26-QexJ0Zge-FhO08jVdYTioQ",
})(MapContainer);
