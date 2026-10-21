import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getComplaintById , updateComplaint } from "../services/complaintAPI";
import { ArrowLeft, Save } from "lucide-react";

 type Complaint = {
_id :string;
title:string;
description:string;
image:string;
location :{
  latitude:number;
  longitude:number;
  area ?:string;
  address?:string
};
ai:{
  category :string;
  confidence:number;
  severity:string;
  isDuplicate:boolean;
};
status:string;
 }

export const EditComplaint = () => {

  const {id} = useParams<{id:string}>();
  const navigate = useNavigate();

  const [ complaint , setcomplaint] = useState<Complaint | null>(null);
  const [ title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [ loading , setLoading] = useState(true);
  const [ saving , setSaving] = useState(false);
  const [ error, setError] = useState("");

  // fetching the exitsing complaint 
  useEffect( () =>{
    const loadComplaint = async()=>{
      if(!id){
        setError("Complaint ID is missing");
        setLoading(false);
        return;
      }
      try {
        const data = await getComplaintById(id);

        if(!data || data.message === "Complaint not found"){
          setError("Complaint not found");
          return;
        }
        setcomplaint(data);
        setTitle(data.title);
        setDescription(data.description);
      }catch(err){
        console.error("failed to load complaint:",err);
        setError("unable to load complaint");

      }finally{
        setLoading(false);
      }
    };
    loadComplaint();
  },[id]);

  // save the changes
  const handleSubmit = async(
    e:React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      if(!id || ! complaint)return;
      setSaving(true);
      setError("");
      try {
      await updateComplaint(id, {
        title: title.trim(),
        description: description.trim(),
    });

    alert("complaint updated successfully");
    navigate("/mycomplaints");

   }catch(err){
    console.error(err);
    setError("failed to update complaint . please try again");
   }finally{
    setSaving(false);
    }

   
   };


  if (loading) {
    return <div className="p-8 text-center">Loading complaint...</div>;
  }

  if (error && !complaint) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate("/mycomplaints")}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Back to My Complaints
        </button>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
  <div className="max-w-3xl mx-auto space-y-6">
    
    {/* Clean, high-visibility back button with active transition positioning */}
    <button
      onClick={() => navigate("/mycomplaints")}
      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-900 transition-colors focus:outline-none focus:text-indigo-900 group"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
      Back to My Complaints
    </button>

    {/* Primary modification console card */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      
      {/* Official Government style header band */}
      <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Edit Complaint Record</h1>
        <p className="font-mono text-xs font-semibold text-slate-400 mt-1.5">
          Grievance Record Token ID: <span className="text-slate-600 font-bold">{complaint._id}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Input element: Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Complaint Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={150}
            className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors bg-slate-50/50 p-3 border font-medium text-slate-800"
          />
        </div>

        {/* Input element: Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Description Context
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors bg-slate-50/50 p-3 border font-medium text-slate-700 leading-relaxed"
          />
        </div>

        {/* Current Imagery Telemetry Canvas */}
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Complaint Image</h2>
          {complaint.image ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shadow-inner relative">
              <img
                src={complaint.image}
                alt={complaint.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-400 italic bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">No image binary matrix available.</p>
          )}
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            The existing image payload will remain unchanged within MongoDB structures unless reassigned.
          </p>
        </div>

        {/* Read-Only AI Telemetry & Metadata Ledger */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-inner text-xs font-medium text-slate-600">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-2">Immutable Ticket Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p>Category: <strong className="text-slate-800">{complaint.ai?.category ?? "Not analyzed"}</strong></p>
            <p>Threat Severity: <strong className="text-rose-700">{complaint.ai?.severity ?? "Not analyzed"}</strong></p>
            <p className="sm:col-span-2 truncate">Location: <strong className="text-slate-800">{complaint.location?.address ?? "Unavailable"}</strong></p>
            <p className="sm:col-span-2 flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-200/60">
              System Lifecycle Status: 
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700">
                {complaint.status}
              </span>
            </p>
          </div>
        </div>

        {/* Dynamic Exception error string rendering */}
        {error && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-1.5 animate-shake">
            ⚠️ Operation Error: {error}
          </p>
        )}

        {/* Authorize Changes CTA button */}
        <button
          type="submit"
          disabled={saving || !title.trim() || !description.trim()}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-900 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold tracking-wide shadow-md transition-colors active:scale-[0.99]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-700 animate-spin"></span>
              Commiting Changes to Cloud Ledger...
            </span>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  </div>
</div>

  );
};

