import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  MapPin,
  Eye,
  Trash2,
  AlertCircle,
  
} from "lucide-react";
import toast from "react-hot-toast";
import {
  
  updateComplaint,
  deleteComplaint,
} from "../../services/complaintAPI";
import type { Complaint } from "../../../types";
import { getAdminComplaints } from "../../services/complaintAPI";
import { useNavigate } from "react-router-dom";

type Status =
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed";

const STATUSES: Status[] = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

export const AdminComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminComplaints();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the complaints API.");
      }

      setComplaints(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load complaints.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Dynamically extract unique areas present in your database records
  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    complaints.forEach((c) => {
      if (c.location?.area) {
        areas.add(c.location.area.trim());
      }
    });
    return Array.from(areas);
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !query ||
        (complaint.title ?? "").toLowerCase().includes(query) ||
        (complaint.description ?? "").toLowerCase().includes(query) ||
        (complaint.ai?.category ?? "").toLowerCase().includes(query) ||
        String(complaint._id ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status?.trim() === statusFilter;

      const matchesArea =
        areaFilter === "All" ||
        complaint.location?.area === areaFilter;

      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [complaints, search, statusFilter, areaFilter]);

  const handleStatusChange = async (
    complaintId: string,
    newStatus: Status
  ) => {
    // Correctly shallow clone state array to safeguard the rollback backup
    const previousComplaints = [...complaints];
    
    // Smoothly apply optimistic updates to the UI ahead of the API call
    setComplaints((current) =>
      current.map((complaint) =>
        complaint._id === complaintId 
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );

    try {
      await updateComplaint(complaintId, { status: newStatus });
      toast.success("Complaint status updated.");
    } catch (err) {
      // Revert cleanly to previous state references if data handshake fails
      setComplaints(previousComplaints);
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update complaint status."
      );
    }
  };

  const handleDelete = async (complaintId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteComplaint(complaintId);

      setComplaints((current) =>
        current.filter((complaint) => complaint._id !== complaintId)
      );

      toast.success("Complaint deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete complaint."
      );
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status: string) => {
    switch (status.trim()) {
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Assigned":
        return "bg-purple-100 text-purple-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const severityClass = (severity?: string) => {
    switch (severity) {
      case "High":
        return "text-red-700 font-semibold";
      case "Medium":
        return "text-amber-700 font-medium";
      case "Low":
        return "text-green-700";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-green-700">
            ADMINISTRATION
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Manage Complaints
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review, filter, and manage citizen reports from Bandra East and West.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchComplaints}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total complaints</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : complaints.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending complaints</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {loading
              ? "—"
              : complaints.filter(
                  (item) => (item.status ?? "Pending").trim() === "Pending"
                ).length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Currently displayed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : filteredComplaints.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, category, ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          >
            <option value="All">All areas</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints Table / List Section */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

     
{/* Complaint cards */}
{!loading && filteredComplaints.length > 0 && (
  <div className="space-y-4">
    {filteredComplaints.map((complaint) => (
      <div
        key={complaint._id}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {complaint.title}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                  complaint.status
                )}`}
              >
                {complaint.status}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {complaint.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} />
                {complaint.location?.area ?? "Area unavailable"}
              </span>

              <span>
                Category: {complaint.ai?.category ?? "Not analyzed"}
              </span>

              <span>
                Severity:{" "}
                <span className={severityClass(complaint.ai?.severity)}>
                  {complaint.ai?.severity ?? "Unknown"}
                </span>
              </span>

              <span>
                Reported: {formatDate(complaint.createdAt)}
              </span>
            </div>

            {complaint.location?.address && (
              <p className="mt-2 text-sm text-slate-500">
                Address: {complaint.location.address}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <select
              aria-label={`Update status for ${complaint.title}`}
              value={complaint.status?.trim() ?? "Pending"}
              onChange={(event) =>
                handleStatusChange(
                  complaint._id,
                  event.target.value as Status
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              title="View complaint"
              onClick={() =>
                navigate(`/complaints/${complaint._id}`)
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <Eye size={18} />
            </button>

            <button
              type="button"
              title="Delete complaint"
              onClick={() => handleDelete(complaint._id)}
              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

    </div>
  );
};
