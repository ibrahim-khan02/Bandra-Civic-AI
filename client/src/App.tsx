import { Toaster } from "react-hot-toast"
import { Route, Routes } from "react-router-dom"
import { AppLayout } from "./pages/AppLayout"
import { Home } from "./pages/Home"
import { Createcomplaints } from "./pages/Createcomplaints"
import { MyComplaints } from "./pages/MyComplaints"
import { ComplaintProvider } from "./context/ComplaintContext"
import { DetailComplaint } from "./pages/DetailComplaint"
import { EditComplaint } from "./pages/EditComplaint"
import { ZonalInsights } from "./components/ZonalInsights"
import { AdminLayout } from "./pages/admin/AdminLayout"
import { AdminOverview } from "./pages/admin/AdminOverview"
import { AdminComplaints } from "./pages/admin/AdminComplaints"
import { AdminMap } from "./pages/admin/AdminMap"
import { AdminLogin } from "./pages/admin/AdminLogin"
import RequireAdmin from "./components/RequireAdmin"



export const App = () => {
  return (
    <>
    <ComplaintProvider>
    <Toaster position="top-right" toastOptions={{
        duration : 3000,
       style: {
          background: "#1B3022", color: "#fff", borderRadius: "12px", fontSize: "14px"
       }
    }} />
    <Routes>

      {/*  for admin login */}

      <Route path="/admin/login" element={<AdminLogin/>}/>

        {/* Main page with Nav , footer and banner */}
        
        <Route path="/" element={<AppLayout/>}>
        <Route index element={<Home />}/>
        <Route path="/createcomplaints" element={<Createcomplaints/>} />
        <Route path="/mycomplaints" element={<MyComplaints/>} />
        <Route path="complaints/:id" element={<DetailComplaint/>}/>
        <Route path="complaints/:id/edit" element={<EditComplaint/>}/>

        <Route path="zonalinsights" element={<ZonalInsights/>}/>
        </Route> 


         <Route element={<RequireAdmin/>}/>
         <Route path="/admin" element={<AdminLayout/>}>
        <Route index element={<AdminOverview/>}/>
        <Route path="complaints" element={<AdminComplaints/>}/>
        <Route path="map" element={<AdminMap/>}/>
        
        </Route>


        


        
    </Routes>

   
    </ComplaintProvider>
      
    </>
  )
}
