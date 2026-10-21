import {  LogOutIcon,    SearchIcon, ShieldIcon } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export const Navbar = () => {

 /*  const user: any = { name: "Ibrahim Khan", email: "ibrahimk@123", isAdmin: true } */

  const handelLogout = () => {

    sessionStorage.removeItem("adminToken");
    setUserMenuOpen(false);
    navigate("/");
    
   
  };

  // applying useState for the function of components
  const [searchQuery, setSearchQuery] = useState("")
  //const [complaints,setComplaints] = useComplaints()
  
  //const [complaintCount , setComplaintCount] = useComplaintBox();
  const [, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-6">

        {/* BMC logo / Government Branding */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="logo.png" alt="BMC_LOGO" className="h-9 w-auto object-contain transition-transform duration-200 hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">Civic-AI</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">BMC Zonal</span>
          </div>
        </Link>


        {/* Center Navigation */}
<div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600">
  <Link
    to="/"
    className="hover:text-indigo-900 transition-colors"
  >
    Home
  </Link>

  <Link
    to="/allcomplaints"
    className="hover:text-indigo-900 transition-colors"
  >
    All Complaints
  </Link>



  <Link to="/zonalinsights" className="hover:text-indigo-900 transition-colors">
    Zonal Insights
  </Link>
</div>

{/* Search by Area */}
<form
  className="hidden sm:flex flex-1 max-w-xs"
  onSubmit={(e) => {
    e.preventDefault();
    navigate(`/allcomplaints?area=${encodeURIComponent(searchQuery)}`);
  }}
>
  <div className="relative w-full">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

    <input
      type="text"
      placeholder="Search by area..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
    />
  </div>
</form>



{/* Admin Button + Logout Icon */}
<div className="flex items-center gap-2 shrink-0">
  <Link
    to="/admin/login"
    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-indigo-900 rounded-full hover:bg-slate-900 transition-all shadow-sm"
  >
    <ShieldIcon size={14} />
    Admin
  </Link>

  <button
    type="button"
    onClick={handelLogout}
    title="Logout"
    aria-label="Logout"
    className="flex items-center justify-center rounded-full p-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
  >
    <LogOutIcon size={20} />
  </button>
</div>

</div>

</nav>
  )
}
