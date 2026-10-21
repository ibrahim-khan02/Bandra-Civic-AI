
import { useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";

interface Complaint {
  _id: string;
  title: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    area?: string;
  };
  ai?: {
    category?: string;
    severity?: "Low" | "Medium" | "High";
  };
  status?: string;
}

interface ComplaintMapProps {
  complaints: Complaint[];
}

const severityColors: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

function createPin(severity?: string) {
  const color = severityColors[severity ?? ""] ?? "#38bdf8";

  return L.divIcon({
    className: "civic-map-pin-wrapper",
    html: `<div style="
      width:18px;height:18px;background:${color};
      border:3px solid #fff;border-radius:50%;
      box-shadow:0 0 12px ${color},0 0 24px ${color}66;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500";

export default function ComplaintMap({
  complaints,
}: ComplaintMapProps) {
  const [areaFilter, setAreaFilter] = useState("All areas");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");

  const validComplaints = useMemo(
    () =>
      complaints.filter((complaint) => {
        const lat = complaint.location?.latitude;
        const lng = complaint.location?.longitude;

        return (
          typeof lat === "number" &&
          typeof lng === "number" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          Math.abs(lat) <= 90 &&
          Math.abs(lng) <= 180
        );
      }),
    [complaints]
  );
  console.log("All complaints:",complaints.length);
  console.log("Valid Complaints:",validComplaints.length);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return validComplaints.filter((complaint) => {
      const area = complaint.location?.area ?? "Unknown";
     /*  if(area!== "Bandra East " && area!="Bandra West"){
        return false;
      } */
      const severity = complaint.ai?.severity ?? "Unknown";
      const status = (complaint.status ?? "Pending").trim();
      const category = complaint.ai?.category ?? "Unclassified";

      const matchesArea =
        areaFilter === "All areas" || area === areaFilter;

      const matchesSeverity =
        severityFilter === "All severities" ||
        severity === severityFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        status === statusFilter;

      const searchableText = [
        complaint.title,
        complaint.description,
        category,
        area,
        complaint.location?.address,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesArea &&
        matchesSeverity &&
        matchesStatus &&
        (!query || searchableText.includes(query))
      );
    });
  }, [
    validComplaints,
    areaFilter,
    severityFilter,
    statusFilter,
    search,
  ]);

  console.log("Filtered complaints",filteredComplaints.length);

  const resetFilters = () => {
    setAreaFilter("All areas");
    setSeverityFilter("All severities");
    setStatusFilter("All statuses");
    setSearch("");
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold">
            Civic Issues Map
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Bandra East &amp; Bandra West
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2">
          <p className="text-xl font-bold text-cyan-400">
            {filteredComplaints.length}
            <span className="ml-1 text-sm font-normal text-slate-400">
              / {validComplaints.length}
            </span>
          </p>
          <p className="text-xs text-slate-400">
            Matching complaints
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-800 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search complaints..."
          aria-label="Search complaints"
          className={selectClass}
        />

        <select
          value={areaFilter}
          onChange={(event) => setAreaFilter(event.target.value)}
          aria-label="Filter by area"
          className={selectClass}
        >
          <option>All areas</option>
          <option>Bandra East</option>
          <option>Bandra West</option>
        </select>

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          aria-label="Filter by severity"
          className={selectClass}
        >
          <option>All severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Unknown">Unknown</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option>All statuses</option>
          <option>Pending</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="text-left text-sm text-cyan-400 transition-colors hover:text-cyan-300 sm:col-span-2 xl:col-span-4"
        >
          Reset all filters
        </button>
      </div>

      <div className="relative">
        <MapContainer
          center={[19.055, 72.835]}
          zoom={14}
          scrollWheelZoom
          style={{
            height: "480px",
            width: "100%",
            background: "#0b1220",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/attribution/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {filteredComplaints.map((complaint) => (
            <Marker
              key={complaint._id}
              position={[
                complaint.location!.latitude,
                complaint.location!.longitude,
              ]}
              icon={createPin(complaint.ai?.severity)}
            >
              <Popup className="civic-dark-popup">
                <div style={{ minWidth: 190, color: "#111827" }}>
                  <strong>{complaint.title}</strong>

                  <p>
                    Category:{" "}
                    {complaint.ai?.category ?? "Unclassified"}
                  </p>
                  <p>
                    Severity:{" "}
                    {complaint.ai?.severity ?? "Unknown"}
                  </p>
                  <p>
                    Area: {complaint.location?.area ?? "Unknown"}
                  </p>
                  <p>
                    Status: {(complaint.status ?? "Pending").trim()}
                  </p>

                  {complaint.description && (
                    <p>{complaint.description}</p>
                  )}

                  {complaint.location?.address && (
                    <p>{complaint.location.address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {filteredComplaints.length === 0 && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-[1000] rounded-xl border border-slate-700 bg-slate-950/95 p-4 text-center shadow-lg">
            <p className="font-medium text-white">
              No matching complaints
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try changing the filters or search term.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-800 bg-slate-950 px-4 py-4 text-xs text-slate-300">
        {[
          ["High", "#ef4444"],
          ["Medium", "#f59e0b"],
          ["Low", "#22c55e"],
          ["Unknown", "#38bdf8"],
        ].map(([label, color]) => (
          <span key={label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label} severity
          </span>
        ))}
      </div>

      <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
        Showing {filteredComplaints.length} of {validComplaints.length} complaints with valid coordinates.
      </p>
    </section>
  );
}
