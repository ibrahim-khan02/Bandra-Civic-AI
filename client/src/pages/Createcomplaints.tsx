
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaint, reverseGeocode } from "../services/complaintAPI";
import LocationMap from "../components/LocationMap";

type BandraArea = "Bandra East" | "Bandra West";

type Location = {
  latitude: number | null;
  longitude: number | null;
  area: BandraArea | null;
  address: string;
};

type ComplaintFormData = {
  title: string;
  description: string;
  location: Location;
  image: File | null;
};

export const Createcomplaints = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ComplaintFormData>({
    title: "",
    description: "",
    location: {
      latitude: null,
      longitude: null,
      area: null,
      address: "",
    },
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  
 
  // Temporary area detection from the returned address.
  const detectAreaFromAddress = (address: string): BandraArea | null => {
    const normalizedAddress = address.toLowerCase();

    if (normalizedAddress.includes("bandra east")) {
      return "Bandra East";
    }

    if (normalizedAddress.includes("bandra west")) {
      return "Bandra West";
    }

    return null;
  };


  // Get address and provisional area from coordinates.
  const updateLocation = async (
    latitude: number,
    longitude: number
  ) => {
    setFormData((previous) => ({
      ...previous,
      location: {
        latitude,
        longitude,
        address: "",
        area: null,
      },
    }));

    setLocationLoading(true);
    setLocationError("");

    try {
      const result = await reverseGeocode(latitude, longitude);

console.log("Reverse geocoding result:", result);
console.log("Returned address:", result.address);

const area = detectAreaFromAddress(result.address);

      setFormData((previous) => {
        // Avoid applying an old response if the pin has moved again.
        if (
          previous.location.latitude !== latitude ||
          previous.location.longitude !== longitude
        ) {
          return previous;
        }

        return {
          ...previous,
          location: {
            latitude,
            longitude,
            address: result.address,
            area,
          },
        };
      });
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve the address."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Get the citizen's current GPS location.
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void updateLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        setLocationLoading(false);

        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Please allow location access in your browser."
            : "Unable to get your location. Please try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Update the address when the citizen moves the map pin.
  const handleMapLocationChange = (
    latitude: number,
    longitude: number
  ) => {
    void updateLocation(latitude, longitude);
  };

  // Handle title and description.
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Validate and preview the complaint image.
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
    setSubmitMessage("");
  };

  // Submit the complaint to FastAPI.
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubmitMessage("");

    if (
      formData.location.latitude === null ||
      formData.location.longitude === null
    ) {
      setSubmitMessage("Please get your current location.");
      return;
    }

    if (locationLoading) {
      setSubmitMessage("Please wait for the address lookup to finish.");
      return;
    }

    if (!formData.location.address) {
      setSubmitMessage("Please wait until the address is available.");
      return;
    }

    if (!formData.image) {
      setSubmitMessage("Please upload a complaint image.");
      return;
    }

    if (!formData.location.area) {
      setSubmitMessage(
        "The address could not be identified as Bandra East or Bandra West. Please verify the location."
      );
      return;
    }


   

    const { latitude, longitude, area, address } = formData.location;

    setIsSubmitting(true);

    try {
      const response = await createComplaint({
        title: formData.title,
        description: formData.description,
        latitude,
        longitude,
        area,
        address,
        image: formData.image,
      });

      console.log("Complaint created:", response);

      alert("Complaint submitted successfully!");
      navigate("/mycomplaints");
    } catch (error) {
      console.error("Submit complaint error:", error);

      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit complaint."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div
        id="complaint-form-anchor"
        className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-6">
            <h1 className="text-xl font-black text-slate-900">
              Raise a Complaint
            </h1>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Report a civic issue in Bandra East or Bandra West
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            {/* Complaint title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-xs font-bold uppercase text-slate-700"
              >
                Complaint Title
              </label>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="Pothole near Turner Road"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            {/* Complaint description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-xs font-bold uppercase text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Explain the civic issue and its exact location."
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            {/* Location and interactive map */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Complaint Location
              </label>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {locationLoading
                  ? "Getting location..."
                  : "Use My Current Location"}
              </button>

              {locationError && (
                <p className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                  {locationError}
                </p>
              )}

              {formData.location.latitude !== null &&
                formData.location.longitude !== null && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">
                      Confirm Complaint Location
                    </h3>

                    <LocationMap
                      latitude={formData.location.latitude}
                      longitude={formData.location.longitude}
                      onLocationChange={handleMapLocationChange}
                    />

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-700">
                        <span className="mr-1">📍</span>
                        Detected Address
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {formData.location.address ||
                          "Finding address..."}
                      </p>

              
{formData.location.area ? (
  <p className="mt-2 text-sm font-medium text-indigo-700">
    Selected area: {formData.location.area}
  </p>
) : (
  <div className="mt-3 space-y-2">
    <label
      htmlFor="complaint-area"
      className="block text-xs font-bold uppercase text-slate-700"
    >
      Select Your Area
    </label>

    <select
      id="complaint-area"
      value={formData.location.area ?? ""}
      onChange={(event) => {
        const value = event.target.value as BandraArea | "";

        setFormData((previous) => ({
          ...previous,
          location: {
            ...previous.location,
            area: value || null,
          },
        }));

        setSubmitMessage("");
      }}
      required
      className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
    >
      <option value="" disabled>
        Choose Bandra East or Bandra West
      </option>
      <option value="Bandra East">Bandra East</option>
      <option value="Bandra West">Bandra West</option>
    </select>

    <p className="text-xs text-amber-700">
      The area was not detected from the address.
      Please select the correct area for the map pin.
    </p>
  </div>
)}

                      <p className="mt-3 text-xs text-slate-500">
                        Drag the pin or click the map to adjust the
                        complaint location.
                      </p>

                      <p className="mt-2 break-all text-xs text-slate-400">
                        Latitude: {formData.location.latitude.toFixed(6)}
                        {" · "}
                        Longitude: {formData.location.longitude.toFixed(6)}
                      </p>
                    </div>

                    {locationLoading && (
                      <p className="text-sm text-slate-500">
                        Updating address...
                      </p>
                    )}
                  </div>
                )}

              <p className="text-xs text-slate-500">
                Map data © OpenStreetMap contributors.
              </p>
            </div>

            {/* Complaint image */}
            <div className="space-y-2">
              <label
                htmlFor="complaint-image"
                className="block text-xs font-bold uppercase text-slate-700"
              >
                Complaint Image
              </label>

              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:bg-slate-100">
                <input
                  id="complaint-image"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  required
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-semibold file:text-indigo-700"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Take a photo using your device camera or select an image.
                  Maximum size: 10 MB.
                </p>
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold text-slate-700">
                    Image Preview
                  </p>

                  <img
                    src={preview}
                    alt="Complaint preview"
                    className="max-h-72 w-full rounded-xl border border-slate-200 bg-slate-100 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Submission error */}
            {submitMessage && (
              <p
                role="alert"
                className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"
              >
                {submitMessage}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || locationLoading}
              className="w-full rounded-xl bg-indigo-700 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting complaint..."
                : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Createcomplaints;
