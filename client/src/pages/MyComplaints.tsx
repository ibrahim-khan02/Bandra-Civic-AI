import { useNavigate } from "react-router-dom"

import { ArrowLeft, EyeIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteComplaint, getComplaints } from "../services/complaintAPI";


export const MyComplaints = () => {

    const navigate = useNavigate();
    const [complaints, setComplaints] =useState<any[]>([])
    const [loading , setLoading] = useState(true)
    //const {complaints , removeComplaint} = useComplaint();
    useEffect( ()=>{
      const loadComplaints = async()=>{
       try 
       {
        const data = await getComplaints();
        console.log("Complaints from FastAPI",data);

        setComplaints(data);
       } catch (error){
        console.error("Failed to load complaints:",error);
        alert (
          error instanceof Error ? error.message:"Failed to delete complaint"
        )
       } finally{
        setLoading(false)
       }
          



      };
      loadComplaints();
    },[]);

    /* for delete option  */

    const handleDelete = async (complaintId:string)=>{
      const confirmed = window.confirm(
        "Are you sure you  want to delete this complaint?"
      );
      if(!confirmed) return;

      try{
        await deleteComplaint(complaintId);

        // remove the deleted complaint from the UI
        setComplaints((previousComplaints)=>
        previousComplaints.filter(
          (complaint)=>complaint._id !==complaintId
        ));

        console.log("Complaint deleted successfully");


      }catch(error){
        console.error("Failed to delete  complaint:",error);
        alert("Failed to delete complaint.Try again !")
      }
    }

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Complaints</h1>
      </div>

      <div >
        <button onClick={()=>navigate(-1)}
        className="mb-6 flex items-center gap-2 rounded-lg px-3 text-gray-600 hover:bg-gray-200 hover:text-gray-900">

        
        <ArrowLeft className="size-8"/>Back
        </button>
      
      </div>

      {/* Complaints */}
      <div className="space-y-6">

        {complaints.length === 0 ? (
          
          /* No complaints */
          <div className="bg-white rounded-2xl p-10 text-center">
            <h2 className="text-xl font-semibold">
              No Complaints yet
            </h2>

            <p className="text-gray-500 mt-2">
              You haven't raised a complaint
            </p>
          </div>

        ) : (

          /* Complaints list */
          complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
            >

              <div className="flex gap-6">

                {/* Left Image */}
                <div className="w-64 h-52 shrink-0">
                  <img
                    src={complaint.image}
                    alt={complaint.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Right Side Details */}
                <div className="flex-1">

                  {/* Title + Delete */}
                  <div className="flex items-start justify-between">

                    <div>
                      <h2 className="text-xl font-semibold">
                        {complaint.title}
                      </h2>

                      <p className="text-sm text-gray-500 mt-2">
                        {complaint.description}
                      </p>
                    </div>

                    <button onClick={()=>handleDelete(String(complaint._id))}
                    title="Delete Complaint"
                    aria-label={"Delete complaint : ${complaint.title}"}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2Icon className="size-5" />
                    </button>

                  </div>

                  {/* Details */}
                  <div className="mt-5 space-y-3">

                    {/* Category */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Category
                      </span>

                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {complaint.ai.category}
                      </span>
                    </div>

                    {/* Severity */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Severity
                      </span>

                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {complaint.ai.severity}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Status
                      </span>

                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {complaint.status}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="size-4" />

                      {complaint.location.address ||
                        complaint.location.area ||
                        "Location unavailable"}
                    </div>

                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">

                    {/* View Details */}
                    <button
  onClick={() =>
    navigate(`/complaints/${complaint._id}`)
  }
  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
>
  <EyeIcon className="size-4" />
  View Details
</button>

                    {/* Edit only when Pending */}
                    {complaint.status === "Pending" && (
                      <button
    onClick={() =>
      navigate(`/complaints/${complaint._id}/edit`)
    }
    className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-200"
  >
    <PencilIcon className="size-4" />
    Edit
  </button>
                    )}

                  </div>

                </div>

              </div>

            </div>
          ))

        )}

      </div>
    </div>
  </div>
);
};
