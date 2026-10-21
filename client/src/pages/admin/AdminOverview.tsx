
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { getComplaints } from "../../services/complaintAPI";
import type { Complaint } from "../../../types";

export const AdminOverview = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getComplaints();

      if (!Array.isArray(data)) {
        throw new Error("The API did not return a complaints array.");
      }

      setComplaints(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status.trim() === "Pending"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status.trim() === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status.trim() === "Resolved"
  ).length;

  const recentComplaints = [...complaints]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const statCards = [
    {
      title: "Total Complaints",
      value: totalComplaints,
      icon: FileText,
      color: "bg-slate-100 text-slate-700",
    },
    {
      title: "Pending",
      value: pendingComplaints,
      icon: Clock,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "In Progress",
      value: inProgressComplaints,
      icon: Activity,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Resolved",
      value: resolvedComplaints,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
  ];

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status: string) => {
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

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-700">
            BANDRA CIVIC AI
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor civic complaints across Bandra East and Bandra West.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 shrink-0 text-red-600"
              size={20}
            />

            <div>
              <p className="font-semibold text-red-800">
                Could not load complaints
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>

          <button
            onClick={fetchComplaints}
            className="self-start rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {loading ? "—" : stat.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent complaints */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Complaints
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The latest complaints received by the system.
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading complaints...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Recent complaints are unavailable.
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              size={32}
              className="mx-auto text-slate-300"
            />
            <p className="mt-3 font-medium text-slate-700">
              No complaints yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              New citizen complaints will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Complaint
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Area
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((complaint) => (
                  <tr
                    key={complaint._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {complaint.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {complaint.ai.category}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={14} />
                        {complaint.location.area ?? "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                          complaint.status
                        )}`}
                      >
                        {complaint.status.trim()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(complaint.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/complaints/${complaint._id}`}
                        className="text-sm font-semibold text-green-800 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
