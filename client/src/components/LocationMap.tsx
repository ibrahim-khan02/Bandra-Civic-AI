
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

export interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

const pinIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({
  latitude,
  longitude,
}: Pick<LocationMapProps, "latitude" | "longitude">) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 17);
  }, [map, latitude, longitude]);

  return null;
}

function ClickToMovePin({
  onLocationChange,
}: Pick<LocationMapProps, "onLocationChange">) {
  useMapEvents({
    click(event) {
      onLocationChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        scrollWheelZoom
        style={{ height: "350px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater latitude={latitude} longitude={longitude} />
        <ClickToMovePin onLocationChange={onLocationChange} />

        <Marker
          position={[latitude, longitude]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const position = event.target.getLatLng();
              onLocationChange(position.lat, position.lng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
