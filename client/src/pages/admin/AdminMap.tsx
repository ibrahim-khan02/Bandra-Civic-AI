
import { useCallback, useEffect, useState } from "react";
import ComplaintMap from "../../components/ComplaintMap";
import { getComplaints } from "../../services/complaintAPI";
interface Complaint {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    area?: string;
  };
  ai?: {
    category?: string;
    severity?: "Low" | "Medium" | "High";
    isDuplicate?: boolean;
  };
  status?: string;
  createdAt?: string;
}




export const AdminMap = () => {

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadComplaints = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getComplaints();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected complaint API response.");
      }

      setComplaints(data);
    } catch (err) {
      console.error("Failed to load zonal complaints:", err);
      setError("Unable to load complaints. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-cyan-400">
              BANDRA CIVIC AI
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Zonal Insights
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
              Monitor civic complaints across Bandra East and Bandra West.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadComplaints(true)}
            disabled={loading || refreshing}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-cyan-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh data"}
          </button>
        </header>

        {loading ? (
          <section
            aria-label="Loading zonal insights"
            aria-live="polite"
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="h-3 w-28 rounded bg-slate-700" />
                  <div className="mt-4 h-7 w-16 rounded bg-slate-800" />
                </div>
              ))}
            </div>

            <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="h-5 w-48 rounded bg-slate-700" />
              <div className="mt-3 h-3 w-64 max-w-full rounded bg-slate-800" />
              <div className="mt-5 h-[400px] rounded-xl bg-slate-800" />
            </div>

            <p className="text-sm text-slate-500">
              Loading complaint data from the server...
            </p>
          </section>
        ) : error ? (
          <section
            role="alert"
            className="rounded-2xl border border-red-900/70 bg-slate-900 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-950 p-3 text-xl text-red-400">
                !
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  Couldn't load zonal insights
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void loadComplaints()}
                  className="mt-5 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Total complaints</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {complaints.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">High severity</p>
                <p className="mt-2 text-3xl font-bold text-red-400">
                  {complaints.filter(
                    (complaint) => complaint.ai?.severity === "High"
                  ).length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {complaints.filter(
                    (complaint) =>
                      (complaint.status ?? "Pending").trim() === "Pending"
                  ).length}
                </p>
              </div>
            </section>

            <ComplaintMap complaints={complaints} />

            {complaints.length === 0 && (
              <p className="text-center text-sm text-slate-500">
                No complaints have been submitted yet.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}


