import type { Complaint } from "../../types";

const API_URL = "http://127.0.0.1:8000";

export interface CreateComplaintData {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    area: "Bandra East" | "Bandra West";
    address: string;
    image: File;
}

export const createComplaint = async (
    data: CreateComplaintData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append(
        "latitude",
        data.latitude.toString()

    );
    formData.append(
        "longitude",
        data.longitude.toString()
    );
    formData.append("area", data.area);
    formData.append("address", data.address);
    formData.append("image", data.image);

    const response = await fetch(
        `${API_URL}/api/complaints`,
        {
            method: "POST",
            body: formData,
        }
    );
    /* if(!response.ok){
        throw new Error("failed to create complaint")
    } */
    if (!response.ok) {
        const errorData = await response.text();

        console.error("Status:", response.status);
        console.error("FastAPI error response:", errorData);

        throw new Error(errorData);
    }
    return response.json();

}


// route for geocoding
export interface ReverseGeocodeResult{
    latitude : number;
    longitude:number;
    address:string;
    address_details:Record<string,unknown>;
    source:string;
}

export const reverseGeocode = async(
    latitude:number,
    longitude:number
):Promise<ReverseGeocodeResult>=>{
    const params =  new URLSearchParams({
        lat:String(latitude),
        lon:String(longitude),
    });

    const response = await fetch(
        `${API_URL}/api/geocode/reverse?${params.toString()}`
    );

    if(!response.ok){
        const errorText = await response.text();
        throw new Error(`Address lookup failed : ${errorText}`);
    }
    return response.json();
}

export const getComplaints = async () => {
    const response = await fetch(
        `${API_URL}/api/complaints`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch complaint");

    }
    return response.json();
}

export const getComplaintById = async (complaintId: string) => {
    const response = await fetch(
        `${API_URL}/api/complaints/${complaintId}`

    );
    if (!response.ok) {
        throw new Error("Failed to fetch Complaint");

    }
    return response.json();
};

export const updateComplaint = async (complaintId: string,
    data: Partial<Complaint> 
       

    
) => {
    const response = await fetch(
        `${API_URL}/api/complaints/${complaintId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to update complaint");

    }
    return response.json();



};


/* delete  */
export const deleteComplaint = async (complaintId: string) => {
    const response = await fetch(
        `${API_URL}/api/complaints/${encodeURIComponent(complaintId)}`,
        {
            method: "DELETE",

        }
    );
    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Failed to delete Complaint (${response.status}):${errorText}`
        );
    }
    return response.json();
}


export interface ComplaintResponse {
    _id: string;
    title: string;
    description: string;
    image: string | null;
    location: {
        latitude: number;
        longitude: number;
        area: "Bandra East" | "Bandra West";
        address?: string | null;
    };
    ai: {
        category: string;
        confidence: number;
        severity: "Low" | "Medium" | "High";
        isDuplicate: boolean;
        duplicateComplaintId?: string | null;
    };
    status: "Pending" | "Assigned" | "In Progress" | "Resolved" | "Closed";
    createdAt: string;
    updatedAt: string;
}



export const getAdminComplaints = async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        throw new Error("Admin session expired. Please log in again.");
    }

    const response = await fetch(
        `${API_URL}/api/admin/complaints`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        throw new Error("Admin session expired or access denied. Please log in again.");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch admin complaints.");
    }

    return response.json();
};

