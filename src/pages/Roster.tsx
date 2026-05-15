import { motion } from "motion/react";

export default function Roster() {
  const players = [
    {
      id: "03",
      name: "Aryan V.",
      role: "FORWARD",
      height: "6'1\"",
      rating: "88%",
      agility: "92",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG_ivYDVsvS7laytCPKDdxSe08SjfTFlOubKrwu6VfE5Kn14he-3JDgZa3lcpfTU-yMjo_m6eAX3LDVqDRdTGRsbwXq3hey842Rs_ev_G7yh1LR0uRq08ck9Keq8VGhSKYpqSfn2pfP4qw4FxhimiEeSPvx4wangTb3y95JKT5aZU0qzrGgE4BxPmFFfwXIgEkjLUMCe_pr0L0AT_uJ7SyzGNH2LchtXBJV34Ec5x6QAiGS9XOfYGgY_WbHSfuIvmDCuju696Eto8"
    },
    {
      id: "18",
      name: "Leo H.",
      role: "GUARD",
      height: "5'9\"",
      rating: "91%",
      agility: "95",
      translateY: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs8LRHTlvs8ordDl2P1sdwEH_dCkvXfz2QnEHKNTsnoEqfAroXOLciiyPeiCNz8xvPa0om7yJT_Cx0FnchSNZ1_ysTdswcpyMxbm4TJaF04dZBsyvGQcmhfIN8kK3wpLokd04kwvVFfY88wooE7FadUxKDP3GEovI2BAT2uaG5S06GD2OmvomkjCYWlP3vLPvRkd3FzYJhhV6jdee5dT2oWwsLihoOTVOT-vX1DRwS1LxNjYaHJy7Czkm4TcA37Hfv_fBhLk6Q87Q"
    },
    {
      id: "TEAM",
      name: "Squad Alpha",
      role: "UNIT",
      height: "ACTIVE",
      rating: "98%",
      agility: "0.850",
      ratingLabel: "Unit Chemistry",
      agilityLabel: "Win Ratio",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3pLPBhg38wV70uJJJ0Sl_JVvkUzTs59i65S2g3ZUR8Q7-C_0MOOgyWI2H-HcJ1XZSvX67oNvu87yTWRP3vpA9N80f5EELKzO7K8D-hwArNbOjvuV6YYOGc3IvunKDnrfnJdOAOox_NteKZ9bL7iaQ_jC7yQ7x2V32OSlC_ObDQ5Pf2sOeD5yU-BD1XmcSAAJAnBWQr_ilbjumb7YAjHIfOmhb6e2VhUCqKvU3A7d8vOFen6BVymbo8w4rvrelsAqI6mXJsklOg88"
    }
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-16"
    >
      <section className="mb-20">
        <h1 className="font-display text-6xl md:text-8xl uppercase mb-4 text-[#ffb4a8] italic">U14 DIVISION</h1>
        <p className="font-sans text-lg text-[#ebbbb4]/70 max-w-2xl">
          The future of elite basketball. Engineering aggression and refining precision in the next generation of Spartans.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        {players.map((player) => (
          <div key={player.id} className={`relative group ${player.translateY ? 'md:translate-y-12' : ''}`}>
            <div className={`absolute -top-6 -left-6 z-10 p-4 shadow-[4px_4px_0px_0px_#ff5540] ${player.translateY ? 'bg-white text-black' : 'bg-[#ff5540] text-[#5c0000]'}`}>
              <span className="font-display text-5xl">{player.id}</span>
            </div>
            
            <div className="glass-card aspect-[3/4] overflow-hidden relative">
              <img 
                alt={player.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                src={player.image}
              />
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black to-transparent">
                <h3 className="font-display text-4xl uppercase text-white mb-2">{player.name}</h3>
                <div className="flex gap-4">
                  <span className="bg-black border border-white px-3 py-1 font-sans font-bold text-xs tracking-widest">{player.role}</span>
                  <span className="bg-black border border-white px-3 py-1 font-sans font-bold text-xs tracking-widest">{player.height}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="border-b-2 border-white/20 pb-2">
                <span className="block font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">
                  {player.ratingLabel || "Power Rating"}
                </span>
                <span className="font-display text-5xl text-[#ffb4a8]">{player.rating}</span>
              </div>
              <div className="border-b-2 border-white/20 pb-2">
                <span className="block font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">
                  {player.agilityLabel || "Agility Score"}
                </span>
                <span className="font-display text-5xl text-[#ffb4a8]">{player.agility}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-card p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-end gap-4 mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffb4a8]"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
            <h2 className="font-display text-5xl uppercase italic tracking-tight leading-none">PERFORMANCE LAB</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <p className="font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">Team Avg Velocity</p>
              <div className="font-display text-6xl text-white">4.2 <span className="text-[#ffb4a8] text-2xl">m/s</span></div>
              <div className="w-full h-1 bg-[#1f1f1f]">
                <div className="w-3/4 h-full bg-[#ffb4a8]"></div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">Shot Precision</p>
              <div className="font-display text-6xl text-white">68.4 <span className="text-[#ffb4a8] text-2xl">%</span></div>
              <div className="w-full h-1 bg-[#1f1f1f]">
                <div className="w-2/3 h-full bg-[#ffb4a8]"></div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">Defense Efficiency</p>
              <div className="font-display text-6xl text-white">92.1 <span className="text-[#ffb4a8] text-2xl">pts</span></div>
              <div className="w-full h-1 bg-[#1f1f1f]">
                <div className="w-[92%] h-full bg-[#ffb4a8]"></div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-sans font-bold text-xs tracking-widest text-[#ebbbb4]/70 uppercase">Recovery Index</p>
              <div className="font-display text-6xl text-white">High</div>
              <div className="w-full h-1 bg-[#1f1f1f]">
                <div className="w-1/2 h-full bg-[#ffb4a8]"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
          <span className="font-display text-[240px] text-white">SPARTAN</span>
        </div>
      </section>
    </motion.main>
  );
}
