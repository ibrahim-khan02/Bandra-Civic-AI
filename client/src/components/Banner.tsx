import { Glasses, XIcon } from "lucide-react";
import { useState } from "react"


export const Banner = () => {
    const [bannerVisible , setBannerVisible] = useState( 
        ()=> {
            return sessionStorage.getItem('banner_dismissed') !=='true';
        }
    )
    const dismissBanner = ()=>
    {
        setBannerVisible(false)
        sessionStorage.setItem("banner_dismissed","true")
    }
  return (
    <div className="w-full">
  {bannerVisible && (
    <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-950 text-white text-xs sm:text-sm relative overflow-hidden border-b border-amber-500/30 shadow-sm animate-fade-in">
      {/* Decorative subtle texture matching official government portals */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-6">

        {/* Center Text with clean typography matching administrative portals */}
        <div className="flex items-center gap-2 tracking-wide font-medium">
          <Glasses className="size-5 shrink-0 text-amber-400" />
          <span className="font-semibold text-slate-100 px-1">Swachh Bharat Abhiyan</span>
          <span className="hidden md:inline-block text-[11px] text-slate-300 font-normal border-l border-slate-700 pl-2">
            Cleanliness Initiative Zonal Portal Grid
          </span> 
        </div>

      </div>
      
      {/* Absolute Dismissal Action Button - Positioned Perfectly */}
      <button 
        onClick={dismissBanner} 
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-md transition-all active:scale-95"
        aria-label="Dismiss Banner"
      >
        <XIcon className="size-4"/>
      </button>

    </div>
  )}
</div>

  )
}


