import { useNavigate } from "react-router-dom"

import { useComplaint } from "../context/ComplaintContext";
import { useEffect, useState } from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import type { Complaint } from "../../types";




export const Home = () => {
  const navigate = useNavigate();

  
const [visibleCount, setVisibleCount] = useState(0);
const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);

useEffect(() => {
  setVisibleCount(0);

  const timer = window.setTimeout(() => {
    setVisibleCount(allComplaints.length);
  }, 2000);

  return () => window.clearTimeout(timer);
}, [allComplaints]);
useEffect(() => {
  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/complaints"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setAllComplaints(Array.isArray(data) ? data : data.complaints ?? []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  fetchComplaints();
}, []);
  return (

    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">

      

    {/* 1. Power BI Dashboard */}
    
    {/* 1. Power BI Dashboard — Temporary Image */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Dashboard Header */}
        <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-200 uppercase">
              Live Zonal Analytics Portal
            </h2>
          </div>

          <span className="text-xs text-slate-400">
            Power BI Dashboard Preview
          </span>
        </div>

        {/* Temporary Dashboard Image */}
        <div className="w-full bg-slate-950">
          <img
            src="/dashboard.png"
            alt="Bandra Civic AI zonal analytics dashboard preview"
            className="block w-full h-auto"
          />
        </div>

        {/* Temporary Preview Notice */}
        <div className="bg-slate-900 px-5 py-3 text-center">
          <p className="text-xs text-slate-400">
            Dashboard preview • Interactive Power BI integration pending
          </p>
        </div>
      </div>
    </div>




    
{/* 2. All Complaints */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        All Complaints
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        Track civic issues reported in Bandra East and Bandra West.
      </p>
    </div>

    <button
      onClick={() => navigate("/mycomplaints")}
      className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
    >
      View all <ArrowRight size={16} />
    </button>
  </div>

  {allComplaints.length === 0 ? (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="font-semibold text-slate-700">
        No complaints yet
      </p>
      <p className="text-sm text-slate-500 mt-1">
        New civic complaints will appear here.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {allComplaints.slice(0, visibleCount).map((complaint, index) => (
        <article
          key={complaint._id}
         style={{
  animation: "complaintSlideRight 2s ease-out both",
  animationDelay: `${index * 100}ms`,
}}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
        >
          {complaint.image && (
            <img
              src={complaint.image}
              alt={complaint.title}
              className="h-44 w-full object-cover"
            />
          )}

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-slate-900 line-clamp-2">
                {complaint.title}
              </h3>

              <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {complaint.status.trim()}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 line-clamp-2">
              {complaint.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} />
              <span>
                {complaint.location?.area || "Bandra"}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Clock size={16} />
              <span>
                {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleDateString()
                  : "Date unavailable"}
              </span>
            </div>

            <button
              onClick={() => navigate(`/complaints/${complaint._id}`)}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </article>
      ))}
    </div>
  )}
</section>

<style>{`
  @keyframes complaintSlideRight {
    from {
      opacity: 0;
      transform: translateX(-60px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`}</style>


    


    {/* 2. Raise Complaint Button */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <a
        href="/createcomplaints"
        className="group w-full bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-slate-900 hover:to-indigo-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-center"
      >
        <span className="tracking-wide">
          Civic Complaint Resolution System
        </span>
        <span className="text-amber-400 text-sm">
          RAISE A NEW COMPLAINT ↓
        </span>
      </a>
    </div>
    </div>
   
   
  )
}


 