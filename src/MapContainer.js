// import react from "react";
import { useState, useEffect } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polygon } from "google-maps-react";
import Tabletop from "tabletop";

function MapContainer(props) {
  const { google } = props;

  const [data, setData] = useState({});
  useEffect(() => {
    Tabletop.init({
      key: "https://docs.google.com/spreadsheets/d/19Za-wgC1G_-TcFNm3j7iMpbmbF9P-PoaA_qKKhyRQCs/pubhtml",
      callback: (googleData) => {
        setData(googleData);
      },
    });
  });

  console.log(data);

  const [showInfoWindow, setShowInfoWindow] = useState(true);

  function onMarkerClick() {
    setShowInfoWindow(!showInfoWindow);
    console.log("clicked");
  }

  function onInfoWindowClose() {
    setShowInfoWindow(false);
  }

  return (
    <Map google={google} zoom={14}>
      <Marker onClick={onMarkerClick} name={"Current location"} />
      <Polygon
        paths={[
          { lat: 37.78178778, lng: -122.4223591 },
          { lat: 37.78282227, lng: -122.4141193 },
          { lat: 37.7797357, lng: -122.413497 },
          { lat: 37.77418972, lng: -122.4206854 },
        ]}
        onClick={onMarkerClick}
      />
      <InfoWindow visible={showInfoWindow} onOpen={() => console.log("opened")} onClose={onInfoWindowClose}>
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
