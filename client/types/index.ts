 export interface Complaint {
    _id:string;
    title:string;
    description:string;
    image:string;
    location:{
        latitude:number;
        longitude:number;
        address?:string;
        area?: "Bandra East" | "Bandra West";
    };

    ai:{
        category:string;
        confidence:number;
        severity:"Low" | "Medium" | "High";
        isDuplicate:boolean;
    };
    status:"Pending" |"Assigned" | "In Progress"| "Resolved"|"Closed";

    createdAt:string;
    updatedAt:string;
}
