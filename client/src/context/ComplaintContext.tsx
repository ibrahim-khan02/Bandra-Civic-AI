import { createContext, useContext, useState, type ReactNode } from "react";
import  type { Complaint } from "../../types";

 export interface ComplaintContext{
    complaints : Complaint[];

    addComplaint : (complaint :Complaint)=>void;
    removeComplaint:(complaintId:string) => void;
    updateComplaint:(
        complaintId:string,
        updateComplaint:Partial<Complaint>

    )=> void;
    


    

}
const ComplaintContext = createContext<ComplaintContext | undefined>(undefined)

export function ComplaintProvider(
    {children}
 : {
    children:ReactNode;

})
 {

    // All complaints 

     const [complaints , setComplaints] = useState<Complaint[]>([]);

     

    // CREATE

    const addComplaint = (complaint : Complaint) =>{
        setComplaints((prev)=>[
            ...prev,
            complaint,
        ]);
    };

    //DELETE

    const removeComplaint = (complaintId: string)=>{
        setComplaints((prev)=>
        prev.filter(
            (complaint)=>complaint._id !== complaintId
        ));
    };

    //Update
    const updateComplaint = (
        complaintId : string,
        updatedComplaint : Partial<Complaint>
    ) =>{
        setComplaints((prev)=>
        prev.map((complaint)=> complaint._id===complaintId ? {
            ...complaint,
            ...updatedComplaint,
        } : complaint
    )
);

};
    

    
    



return (
    <ComplaintContext.Provider
        value={{complaints,addComplaint,removeComplaint,updateComplaint}}>
            {children}
    </ComplaintContext.Provider>
);
}

export function useComplaint(){
    const context = useContext(ComplaintContext);
    if(!context){
        throw new Error(
            "useComplaint must be inside Complaint provider"
        );
    }
    return context;
}

