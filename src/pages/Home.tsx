import { motion } from "motion/react";
import { useState } from "react";
import JoinRanksModal from "../components/JoinRanksModal";
import ScheduleModal from "../components/ScheduleModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-20"
    >
      <JoinRanksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoNZtVfcb3R2eJ2eQYS-7aGcreeuK2InisWw2TsvaG4M9oL_mXXldgPOIQVbEqZfUr_nUmJP0hhBR9PVrCWVk8A4TPE3AdmtJzA4d4gg0BPV0CsroLnBPOeU_bjWysb2uBVM4Phaf7sOcE87NGH_8EfciJ_Lvtco7Nh7IhGb9zUrc_E-RQRxbKUTpDvp7bCmF2gxiIOaVr6zYCllmvzH9GCn0oScBNZYpUD2T02dLD4BGrZjAbSDpoyqiyvDJe9XrEI0wXiyxL53I"
            alt="Basketball court"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-[#131313]/50"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.img 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            alt="Spartans Logo" 
            className="w-48 md:w-64 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(255,180,168,0.3)]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBifdkfBlm6fIHf453HsW6i2bM2itaEWSS5lrRvlDXRg0AU8cvFvfhjx4L42SCHPErJQ85tNZjaD36ghX8GlJ9-bOGKvX981mWVloUH92yQ1UJg4_RzKk15Jf0Cmj3zc680ufmHMhTI3S1IpBpMhjz54s8H7cY--skU4fwDz1-CKaovb12rpLIz6Ry1BvmnThoyYtP3KjPu-hKTPoO-YHfBcHZt_Gggmpr1KEWCBrm76arjMy9dCj6yjwon1horvo84X_aWdM8YkU0"
          />
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-8xl uppercase text-white mb-4 tracking-tighter leading-none"
          >
            AGGRESSION REFINED.<br/>
            <span className="text-[#ff5540]">VICTORY DEFINED.</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-lg text-[#e2e2e2]/80 max-w-2xl mx-auto mb-8"
          >
            Welcome to the home of Aurora's most elite U14 basketball program. Built on grit, sustained by discipline, and driven by the relentless pursuit of excellence.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff5540] text-[#5c0000] font-sans font-bold text-sm tracking-widest px-10 py-4 uppercase shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#ffffff] transition-all"
            >
              JOIN THE RANKS
            </button>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="border-2 border-white text-white font-sans font-bold text-sm tracking-widest px-10 py-4 uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center"
            >
              VIEW SCHEDULE
            </button>
          </motion.div>
        </div>
      </section>

      {/* Season Prospects Section */}
      <section className="py-24 px-4 md:px-16 max-w-7xl mx-auto">
        <h2 className="font-display text-4xl md:text-5xl uppercase mb-12 border-l-8 border-[#ff5540] pl-6">Season Prospects</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 relative bg-[#2a2a2a] aspect-video overflow-hidden group">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ3G64D65Wzyl5yfUiwLDiKihE7oU8EytVXkRo09yhLTTJUuTJcpBykiQhVATenh1tULqApJOJXZgwUJ9Nl0DXfEwwtVRQxEbJlszMGH_O2QJkJBzIaG2dLROlBFxouAh5KmHiKZzt8kADjihC0PAqLHbV6O8JWPqLVb-CZY-hoSKPNaD-IyfDaPGTJNVDl_PRHRrdOac1DitE_7Z7BnRSVswpqFxncEWsVc0vCed9NOghqIpx2l6CXmPMad_djyK5IDEHfPIpmcU"
              alt="Player action"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent flex flex-col justify-end p-8">
              <span className="bg-[#ff5540] text-[#5c0000] px-3 py-1 font-sans font-bold text-xs tracking-widest w-fit mb-2">ELITE STATUS</span>
              <h3 className="font-display text-4xl md:text-5xl uppercase text-white">LEAD SCORERS</h3>
              <div className="flex gap-12 mt-4">
                <div>
                  <p className="text-[#c6c6c7] font-sans font-bold text-xs tracking-widest uppercase">Avg PPG</p>
                  <p className="font-display text-5xl md:text-6xl text-[#ffb4a8]">24.5</p>
                </div>
                <div>
                  <p className="text-[#c6c6c7] font-sans font-bold text-xs tracking-widest uppercase">Accuracy</p>
                  <p className="font-display text-5xl md:text-6xl text-white">58%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-white/10 backdrop-blur-xl border border-white/20 p-8 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-3xl uppercase text-[#ffb4a8] border-b border-[#ffb4a8]/30 pb-2 mb-6">DEFENSIVE INTEL</h4>
              <ul className="space-y-6">
                <li className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="font-sans font-bold text-xs tracking-widest uppercase text-[#c6c6c7]">Blocks/Game</span>
                  <span className="font-display text-3xl text-white">6.2</span>
                </li>
                <li className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="font-sans font-bold text-xs tracking-widest uppercase text-[#c6c6c7]">Steals/Game</span>
                  <span className="font-display text-3xl text-white">12.8</span>
                </li>
                <li className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="font-sans font-bold text-xs tracking-widest uppercase text-[#c6c6c7]">Def Rebounds</span>
                  <span className="font-display text-3xl text-white">34.1</span>
                </li>
              </ul>
            </div>
            <button className="mt-8 font-sans font-bold text-xs tracking-widest text-[#ffb4a8] flex items-center gap-2 group">
              FULL TEAM ANALYTICS <span className="transition-transform group-hover:translate-x-2">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Intel Feed Section */}
      <section className="py-24 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
              THE INTEL <span className="text-[#ff5540]">FEED</span>
            </h2>
            <p className="font-sans text-sm text-[#ebbbb4]/70 max-w-md md:text-right">
              Live updates from the court. Stay ahead of the competition with real-time roster news and tactical updates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group cursor-pointer">
                <div className="relative aspect-square overflow-hidden mb-6">
                  <img 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" 
                    src={
                      item === 1 ? "/images/intel-roster.png" :
                      item === 2 ? "/images/intel-strategy.jpg" :
                      "/images/intel-event.png"
                    }
                    alt="News"
                  />
                  {item === 1 && (
                    <div className="absolute top-0 right-0 bg-[#ff5540] p-4 text-[#5c0000] font-sans font-bold text-xs tracking-widest uppercase">
                      LIVE
                    </div>
                  )}
                  {item === 2 && <div className="absolute inset-0 border-4 border-[#ff5540] pointer-events-none"></div>}
                </div>
                <span className="font-sans font-bold text-xs tracking-widest text-[#ffb4a8] uppercase mb-2 block">
                  {item === 1 ? "Team Update • 2h ago" : item === 2 ? "Strategy • Oct 15" : "Event • Coming Soon"}
                </span>
                <h3 className="font-display text-2xl uppercase mb-4 leading-none">
                  {item === 1 ? "Roster Lock: Final Selections Confirmed" : item === 2 ? "High-Intensity Drill Patterns" : "Aurora Championship Invitational"}
                </h3>
                <p className="font-sans text-sm text-[#ebbbb4]/70">
                  {item === 1 ? "The U14 Aurora roster has been finalized after grueling qualifiers. Meet the titans ready to dominate the provincial circuit." : 
                   item === 2 ? "Breaking down the offensive flow that led to our preseason win streak. Coach Miller analyzes the 'Spartan Wall' defense." : 
                   "Spartans to host the premier U14 invitational this December. Top tier talent from across the region will clash in the arena."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-16 text-center bg-[#ff5540] text-[#5c0000] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 font-display text-[20vw] flex items-center justify-center pointer-events-none select-none uppercase">
          VICTORY
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-5vw uppercase mb-6 tracking-tighter leading-none">PREPARE FOR WAR.</h2>
          <p className="font-sans text-lg mb-12 max-w-2xl mx-auto opacity-90">Are you ready to test your limits? Join the elite. Redefine your game. Secure your place in history.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black font-sans font-bold text-sm tracking-widest px-12 py-5 uppercase shadow-[6px_6px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            GET STARTED NOW
          </button>
        </div>
      </section>
    </motion.main>
  );
}
