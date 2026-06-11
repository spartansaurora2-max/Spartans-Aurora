import { useEffect, useState } from "react";
import { motion } from "motion/react";

type PastFilm = {
  videoId: string;
  title: string;
  views: string;
  date: string;
  duration: string;
  image: string;
};

const DEFAULT_PAST_FILMS: PastFilm[] = [
  {
    videoId: "3r85axnXac4",
    title: "Spartans vs. Titans: Round 2",
    views: "12.4k views",
    date: "2 days ago",
    duration: "24:12",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL2a2kjZXlAw-bX3PJ2lv83dSGkiSAAlPiheizSAAXWwR6Hm49mgI7lEEGfe1jzpnSwiWQvtpJFRy-g0N-PyG6e7iWh81qHC6NDbhw0tk_huIZIb34sL8Mo9is-UV6SWMAhTxbDq86xUfIv_ysCyIBXnji_tpFfeLo0b1OEQK47DRl6Bwiw6zcMbVAVZPVX5U9wAlRIKtnoI2NW7tpoYmfMar8KGCs-QDiOa-NxDphorpVaAdyqkkVTYhSbWiedJFyf4BHDhdrlm0"
  },
  {
    videoId: "bdsW_mRkqf8",
    title: "Season Opener: Full Replay",
    views: "8.9k views",
    date: "1 week ago",
    duration: "18:45",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKm8iuKCzTN4JgIWu0ipNq9z2wdaYXrIL552LbX_pVHZzNeO7aKcuJi12LozJrPgL3JiiiJKoSqDuGpomA1bfGsEhoMFfmuNAEP00PYrOvt0nvJcdCxYdns8UnvtcJGw81g2c__ItmU0_nJwyA3HAAHPh3eQTsEL-t6Dfmd4ch0B_yf5qCNyxklWXn9xQ3nbazrXTk61WCxjz7QqJH-7RJHHfFKLJ7pF01cOGMxPxnf9_eC6698dsSXj-7Jw0xziwB904mwY4nhi4"
  },
  {
    videoId: "L3wKzyIN1yk",
    title: "Quarter Finals Highlights",
    views: "15.2k views",
    date: "2 weeks ago",
    duration: "32:10",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC27UG1JCaIu5irZwQ9Om6RlMQQ8OXl2fkM1VuQ0_suVtl1rIqpUFQo9iizPGBlt56JC4l_fEC7JfDOBo4vPianKTTkVcFZrltWBtRyY4LrwWzTddtj0s9m8i_0VJjnK5TRD0EhOuN-B0voEkEuCOxrmmq8yss1WuCdEjftbsxvsmDpjraCDO4y2_uNanEdNL2--YLgD-HQR8VUjIj4YqwmujgvfaD1H2a5ceyG0cldrr1dqaR1XFw1JckDvHdSkHp0HxAPkdZPSpI"
  }
];

export default function Archive() {
  const [pastFilms, setPastFilms] = useState<PastFilm[]>(DEFAULT_PAST_FILMS);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const playlistId = import.meta.env.VITE_YT_GAMES_PLAYLIST_ID;
    if (!apiKey || !playlistId) {
      return;
    }

    let canceled = false;
    setLoading(true);
    setFetchError("");

    // Pull every page of the "Basketball Game" playlist, newest first.
    (async () => {
      const collected: any[] = [];
      let pageToken = "";
      do {
        const url =
          `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}` +
          `&playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50` +
          (pageToken ? `&pageToken=${pageToken}` : "");
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `YouTube API error: ${response.status}`);
        }
        collected.push(...(data.items || []));
        pageToken = data.nextPageToken || "";
      } while (pageToken);

      const items = collected
        .map((item: any) => {
          const snippet = item.snippet;
          const videoId = snippet?.resourceId?.videoId;
          if (!snippet || !videoId) return null;
          if (snippet.title === "Private video" || snippet.title === "Deleted video") {
            return null;
          }
          const rawDate = item.contentDetails?.videoPublishedAt || snippet.publishedAt;
          const publishedAt = rawDate ? new Date(rawDate) : null;
          const image =
            snippet.thumbnails?.maxres?.url ||
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url ||
            "";
          if (!image) return null;
          return {
            videoId,
            title: snippet.title,
            views: "YouTube upload",
            date: publishedAt
              ? publishedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "",
            duration: "Video",
            image,
            _sort: rawDate || "",
          };
        })
        .filter(Boolean) as Array<PastFilm & { _sort: string }>;

      items.sort((a, b) => b._sort.localeCompare(a._sort));

      if (canceled) return;
      if (items.length) {
        setPastFilms(items.map(({ _sort, ...film }) => film));
      } else {
        setFetchError("No videos found in the Basketball Game playlist.");
      }
    })()
      .catch((error) => {
        if (!canceled) {
          setFetchError(error.message || "Unable to load YouTube videos.");
        }
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-20"
    >
      <section className="relative px-4 md:px-16 max-w-7xl mx-auto mb-20 mt-8">
        <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden group">
          <img 
            className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE4zOTpVxIVhqNH-aUgCG4M0JRIOTpTvU-Zp9iolIjI9lsmb6Vy_aPaI1zzog_a63Huj3utUDH1LUMBuaJ6Nw9exMib57Wxcr5UXDg9vlkuMyFycAYHPq4TszKeSTaiQkb2oTem_4SJMg88VHbUYHxshRmKtXz6x4leMR50LxKtbf7ig8rOQljlsTgxzJTUAuAzDiWEH1GS_BMQ7cTesyC-rWUzgOS0RalPPS-oj4iI6Mwo9W1ZLtkmmuXEpLX5fdFlT281SqDw4Y" 
            alt="U14 Regional Finals"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/80 to-transparent">
            <div className="inline-flex items-center gap-2 bg-[#ff5540] text-white px-3 py-1 font-sans font-bold text-xs tracking-widest uppercase w-fit mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
               Featured Film
            </div>
            <h1 className="font-display text-4xl md:text-8xl uppercase text-white mb-4 max-w-4xl tracking-tighter leading-none">U14 Regional Finals Film</h1>
            <p className="font-sans text-lg text-[#ebbbb4]/70 max-w-2xl mb-8">Witness the grit, the grind, and the glory. Full cinematic coverage of the championship showdown that defined our season.</p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-4 font-sans font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:bg-[#ffb4a8] transition-colors">
                WATCH NOW
              </button>
              <button className="glass-card text-white px-8 py-4 font-sans font-bold text-sm tracking-widest uppercase border border-white/20 hover:bg-white/10 transition-colors">
                FULL STATS
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-16 max-w-7xl mx-auto mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display text-4xl md:text-5xl uppercase text-white tracking-tighter">Past Game Films</h2>
            <div className="h-1 w-24 bg-[#ff5540] mt-2"></div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 border border-white/20 hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="p-2 border border-white/20 hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div className="mb-8 text-sm text-[#ebbbb4]/80">Tap any video card below to watch it on YouTube.</div>

        {(loading || fetchError) && (
          <div className="mb-8 text-sm text-[#ebbbb4]/80">
            {loading ? "Syncing YouTube archive..." : null}
            {fetchError ? <span className="text-red-400">{fetchError}</span> : null}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pastFilms.map((film, idx) => (
            <a
              key={idx}
              href={`https://www.youtube.com/watch?v=${film.videoId}`}
              target="_blank"
              rel="noreferrer"
              className="group cursor-pointer text-left"
            >
              <div className="relative aspect-video mb-4 overflow-hidden glass-card">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" 
                  src={film.image}
                  alt={film.title}
                />
                <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 font-sans font-bold text-[10px] text-white tracking-widest">{film.duration}</div>
                <div className="absolute inset-0 bg-[#ffb4a8]/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </div>
              </div>
              <h3 className="font-display text-2xl uppercase text-white mb-2 group-hover:text-[#ffb4a8] transition-colors">{film.title}</h3>
              <div className="flex items-center gap-4 font-sans text-[#ebbbb4]/70 text-sm">
                <span className="flex items-center gap-1"> {film.views}</span>
                <span className="flex items-center gap-1"> {film.date}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-16 max-w-7xl mx-auto">
        <div className="glass-card p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <span className="font-display text-[240px] leading-none uppercase select-none">ELITE</span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-5xl md:text-6xl uppercase text-white mb-6 leading-none">Join the Elite</h2>
            <p className="font-sans text-lg text-[#ebbbb4]/70 mb-10">Get exclusive access to pre-game tactical breakdowns, film sessions, and early ticket alerts. We don't just play; we prepare.</p>
            <form className="flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <input 
                  className="w-full bg-transparent border-b-2 border-white focus:border-[#ffb4a8] focus:ring-0 text-white placeholder:text-[#ebbbb4]/50 font-sans font-bold py-4 transition-colors" 
                  placeholder="YOUR EMAIL ADDRESS" 
                  type="email"
                />
              </div>
              <button className="bg-[#ff5540] text-white px-12 py-4 font-sans font-bold text-sm tracking-widest uppercase shadow-[4px_4px_0px_0px_#ffffff] hover:bg-white hover:text-black transition-all" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
