//import strict from "assert/strict";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getComplaintById } from "../services/complaintAPI";
import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";

type Complaint = {
  _id:string;
  title:string;
  description:string;
  image:string;
  location:{
    latitude:number;
    longitude:number;
    area?:string;
    address?:string;
  };
  ai:{
    category:string;
    confidence:number;
    severity:string;
    isDuplicate:boolean;

  };
  status:string;


}

export const DetailComplaint = () => {
  const {id} = useParams<{id:string}>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [, setLoading] = useState(true);
  const [error , setError] = useState("");
  useEffect( ()=>{
    const loadComplaint = async () =>{
      if(!id){
        setError("Complaint ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await getComplaintById(id);
        if(data.message === "Complaint not found"){
          setError("Complaint not found");
          }
          else{
            setComplaint(data);
          }

      }catch(err){
        console.log("Failed to load Complaint: ",err);
        setError("unable to load complaint. Try again");

      }finally{
        setLoading(false);
      }
    };
    loadComplaint();
  },[id]
);
if(error || !complaint){
  return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="text-red-600 mb-4">
        {error || "Complaint not found"}
      </p>
      <button
      onClick={()=> navigate("/mycomplaints")}
      className="px-4 py-2 mg-gray-200 rounded-lg bg-amber-300">Back to my Complaints</button>
    </div>
  );
}
return(
<div className="min-h-screen bg-slate-50 text-slate-900 antialiased p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
  <div className="max-w-4xl mx-auto space-y-6">

    {/* Back navigation button with official layout styling links */}
    <button
      onClick={() => navigate("/mycomplaints")}
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-900 transition-colors focus:outline-none focus:text-indigo-900 group"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      Back to My Complaints
    </button>

    {/* Primary card details panel grid */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

      {/* Dynamic Header Block with localized ticket IDs */}
      <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs font-semibold text-slate-400 tracking-tight">
              Grievance Record Token ID: <span className="text-slate-600 font-bold">{complaint._id}</span>
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {complaint.title}
            </h1>
          </div>

          {/* Hardcoded colors swapped with contextual tag states */}
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
            complaint.status?.toLowerCase() === 'resolved' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {complaint.status}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-8 divide-y divide-slate-100">

        {/* Complaint Evidence Telemetry Canvas */}
        <div className="space-y-3 pt-0">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Complaint Image Evidence
          </h2>

          {complaint.image ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shadow-inner relative group">
              <img
                src={complaint.image}
                alt={complaint.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">No image binary matrix available.</p>
          )}
        </div>

        {/* User Description Text Container */}
        <div className="space-y-2 pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Citizen Description Context
          </h2>
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* AI Processing Analytics Matrix Engine grids */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Neural AI Model Insights
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Classification</p>
              <p className="font-extrabold text-slate-800 text-sm mt-1 truncate">
                {complaint.ai?.category ?? "Not analyzed"}
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Threat Severity</p>
              <p className="font-extrabold text-rose-700 text-sm mt-1 truncate">
                {complaint.ai?.severity ?? "Not analyzed"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Metric</p>
              <p className="font-mono font-bold text-slate-800 text-sm mt-1">
                {((complaint.ai?.confidence ?? 0) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duplicate Check</p>
              <p className={`text-sm font-extrabold mt-1 ${complaint.ai?.isDuplicate ? 'text-amber-600' : 'text-slate-800'}`}>
                {complaint.ai?.isDuplicate ? "Flagged Duplicate" : "Unique Entry"}
              </p>
            </div>
          </div>
        </div>

        {/* Geolocation Localization Map block details */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Zonal Coordinates & Localization
          </h2>

          <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <MapPin size={18} className="mt-0.5 shrink-0 text-indigo-900" />
            <div className="text-xs font-medium text-slate-700 space-y-1.5 w-full">
              <p className="text-sm font-bold text-slate-900">{complaint.location?.address || "Physical address payload unavailable"}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-slate-500">
                <p>Zonal Area: <strong className="text-slate-700">{complaint.location?.area || "Unknown"}</strong></p>
                <p className="font-mono">Lat: <span className="text-slate-700 font-semibold">{complaint.location?.latitude ?? "N/A"}</span></p>
                <p className="font-mono">Long: <span className="text-slate-700 font-semibold">{complaint.location?.longitude ?? "N/A"}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Status Audit Trail Anchor */}
        <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl p-4 shadow-md pt-4 mt-6">
          <AlertCircle size={20} className="text-amber-400 shrink-0" />
          <div className="text-xs">
            <p className="font-mono text-slate-400 uppercase tracking-wider text-[10px]">Current Workflow Lifecycle Status</p>
            <p className="text-sm font-bold tracking-wide text-white mt-0.5">{complaint.status}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

  );
};




