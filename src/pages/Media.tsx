import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
};

type CommunityPost = {
  id: string;
  text: string;
  published: string;
  images: string[];
  link: string;
};

type MediaTab = "games" | "photos" | "practice";

const DEFAULT_VIDEO_ITEMS: VideoItem[] = [
  {
    id: "3r85axnXac4",
    title: "Spartans Aurora Highlight",
    thumbnail: "https://img.youtube.com/vi/3r85axnXac4/hqdefault.jpg",
  },
  {
    id: "bdsW_mRkqf8",
    title: "Championship Replay",
    thumbnail: "https://img.youtube.com/vi/bdsW_mRkqf8/hqdefault.jpg",
  },
  {
    id: "L3wKzyIN1yk",
    title: "Locker Room Moments",
    thumbnail: "https://img.youtube.com/vi/L3wKzyIN1yk/hqdefault.jpg",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Spartan Power Highlights",
    thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
  },
];

export default function Media() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEO_ITEMS);
  const [activeTab, setActiveTab] = useState<MediaTab>("games");
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    if (!apiKey || !channelId) {
      return;
    }

    let canceled = false;
    setLoading(true);
    setFetchError("");

    fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }
        const data = await response.json();
        if (canceled) return;
        const items = data.items?.map((item: any) => {
          const videoId = item.id?.videoId;
          const snippet = item.snippet;
          return videoId && snippet
            ? {
                id: videoId,
                title: snippet.title,
                thumbnail:
                  snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
              }
            : null;
        }).filter(Boolean) as VideoItem[];
        if (items?.length) {
          setVideos(items.slice(0, 4));
          setCurrent(0);
        } else {
          setFetchError("No videos found on the configured channel.");
        }
      })
      .catch((error) => {
        if (!canceled) {
          setFetchError(error.message || "Unable to load latest videos.");
        }
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []);

  // Load the @SpartansAurora community "Posts" the first time the Photos tab
  // is opened. These come from our backend, which scrapes them server-side
  // (the YouTube Data API can't return community posts).
  useEffect(() => {
    if (activeTab !== "photos" || postsLoaded) return;

    let canceled = false;
    const apiBase = import.meta.env.VITE_API_URL || "";
    setPostsLoading(true);
    setPostsError("");

    fetch(`${apiBase}/api/community-posts`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (canceled) return;
        if (!response.ok) {
          throw new Error(data.error || `Request failed: ${response.status}`);
        }
        setPosts(Array.isArray(data.items) ? data.items : []);
        if (!data.items?.length) {
          setPostsError("No community posts with images were found.");
        }
      })
      .catch((error) => {
        if (!canceled) setPostsError(error.message || "Unable to load community posts.");
      })
      .finally(() => {
        if (!canceled) {
          setPostsLoading(false);
          setPostsLoaded(true);
        }
      });

    return () => {
      canceled = true;
    };
  }, [activeTab, postsLoaded]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-16"
    >
      <section className="mb-16 relative">
        <h1 className="font-display text-7xl md:text-9xl text-white uppercase italic -skew-x-6 leading-none">
          Elite <br/> <span className="text-[#ffb4a8]">Vault</span>
        </h1>
        <div className="absolute -top-10 -right-4 md:right-0 opacity-10 font-display text-8xl md:text-[120px] select-none pointer-events-none">
          ARCHIVE
        </div>
      </section>

      <section className="mb-12 flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setActiveTab("games")}
          className={`font-sans font-bold text-sm tracking-widest px-6 py-3 uppercase transition-all ${
            activeTab === "games"
              ? "bg-[#ffb4a8] text-[#690100]"
              : "bg-black border border-white/40 text-white hover:bg-white hover:text-black"
          }`}
        >
          Latest Games
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`font-sans font-bold text-sm tracking-widest px-6 py-3 uppercase transition-all ${
            activeTab === "photos"
              ? "bg-[#ffb4a8] text-[#690100]"
              : "bg-black border border-white/40 text-white hover:bg-white hover:text-black"
          }`}
        >
          Photos
        </button>
        {user && (
          <button
            onClick={() => setActiveTab("practice")}
            className={`font-sans font-bold text-sm tracking-widest px-6 py-3 uppercase transition-all ${
              activeTab === "practice"
                ? "bg-[#ffb4a8] text-[#690100]"
                : "bg-black border border-white/40 text-white hover:bg-white hover:text-black"
            }`}
          >
            Practice
          </button>
        )}
        <div className="ml-auto flex items-center gap-2 text-[#ebbbb4]/70">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="21" x2="10" y1="8" y2="8"/><line x1="21" x2="16" y1="12" y2="12"/><line x1="2" x2="3" y1="4" y2="4"/><line x1="2" x2="5" y1="8" y2="8"/><line x1="2" x2="8" y1="12" y2="12"/><line x1="2" x2="20" y1="16" y2="16"/><line x1="2" x2="20" y1="20" y2="20"/></svg>
          <span className="font-sans font-bold text-xs tracking-widest uppercase">Latest First</span>
        </div>
      </section>

      {(loading || fetchError) && (
        <div className="mb-8 text-sm text-white/80">
          {loading ? "Syncing latest YouTube uploads..." : null}
          {fetchError ? <span className="text-red-400">{fetchError}</span> : null}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {activeTab === "games" && (
        <>
        <div className="md:col-span-8 group relative overflow-hidden glass-card">
          <div className="relative aspect-video overflow-hidden">
            <iframe 
              key={videos[current]?.id}
              className="w-full h-full" 
              src={`https://www.youtube.com/embed/${videos[current]?.id}?autoplay=1&mute=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <button 
              onClick={() => setCurrent((current - 1 + videos.length) % videos.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setCurrent((current + 1) % videos.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full ${index === current ? 'bg-[#ffb4a8]' : 'bg-white/50'}`}
                />
              ))}
            </div>

          </div>
        </div>

        <div className="md:col-span-4 glass-card group">
          <div className="p-6">
            <h3 className="font-sans font-bold text-[#ebbbb4]/70 uppercase text-[10px] mb-4 tracking-widest">Video Options</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition hover:border-[#ffb4a8]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      className="w-full aspect-video object-cover transition duration-300 group-hover:scale-105"
                      src={video.thumbnail}
                      alt={video.title}
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-[#ebbbb4]/70">Option {index + 1}</p>
                    <h4 className="font-display text-sm text-white mt-2 leading-tight line-clamp-2">{video.title}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        </>
        )}

        {activeTab === "photos" && (
          <div className="md:col-span-12">
            {postsLoading && (
              <p className="text-sm text-white/80 mb-6">Loading posts from YouTube…</p>
            )}

            {!postsLoading && posts.length === 0 && (
              <div className="glass-card p-12 text-center">
                <h3 className="font-display text-3xl text-white uppercase italic">Community Posts</h3>
                <p className="font-sans text-[#ebbbb4]/70 mt-3">
                  {postsError || "No posts to show right now."}
                </p>
                <a
                  href="https://www.youtube.com/@SpartansAurora/posts"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-6 bg-[#ffb4a8] text-[#690100] font-sans font-bold text-xs tracking-widest px-8 py-3 uppercase hover:bg-white hover:text-black transition-all"
                >
                  Open Posts on YouTube
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.flatMap((post) =>
                post.images.map((src, imageIndex) => (
                  <a
                    key={`${post.id}-${imageIndex}`}
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group glass-card overflow-hidden block"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        src={src}
                        alt={post.text ? post.text.slice(0, 80) : "Spartans Aurora community post"}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                      {(post.text || post.published) && (
                        <div className="absolute bottom-3 left-3 right-3">
                          {post.text && (
                            <p className="font-sans text-xs text-white leading-snug line-clamp-2">{post.text}</p>
                          )}
                          {post.published && (
                            <span className="font-sans text-[10px] uppercase tracking-widest text-[#ebbbb4]/70">{post.published}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "practice" && (
          <div className="md:col-span-12 glass-card p-12 text-center">
            <h3 className="font-display text-3xl text-white uppercase italic">Practice Footage</h3>
            <p className="font-sans text-[#ebbbb4]/70 mt-3">Members-only practice media is coming soon.</p>
          </div>
        )}

        <div className="md:col-span-4 glass-card group relative">
          <div className="aspect-square relative overflow-hidden">
            <img
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDNTT_F-kLJHZiOmhcDFFYxNqMXOstzz_0nw-IV41cBIlY9AaiwSzlLPNQKWJhADIpzM8fd4ngf0NWBZwQBixVEowYkkmgaAZm17rr8dYx40XDQeR8847BcexXQDmxvjpnXNwaPwYkY1Lqb6Cee5QqvF8nhkYx9CYLr594h91ciOr7BHx1214sZDWFCrwmDyNPUrWXhXkYBeGyQaTxYfQc0UfbGpiEm-RIieDwrOLaS0WbigEgLwGOos2n7810qiVZJkmJ6dNQjN8"
              alt="Hard work"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute bottom-4 left-4">
              <span className="font-sans font-bold text-white uppercase tracking-widest text-xs">Hard Work Pays Off</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 glass-card flex flex-col justify-end p-8 border-l-4 border-[#ffb4a8] bg-black relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.4) 1px, transparent 0)", backgroundSize: "16px 16px" }}></div>
          <div className="relative z-10">
            <span className="font-display text-7xl text-[#ffb4a8] block mb-2">98%</span>
            <p className="font-sans font-bold text-white uppercase tracking-widest leading-none text-xs">Victory Ratio <br/> in Regional Finals</p>
          </div>
        </div>

        <div className="md:col-span-4 glass-card group overflow-hidden">
          <div className="relative h-full min-h-[300px]">
            <img 
              className="absolute inset-0 w-full h-full object-cover contrast-110 group-hover:scale-110 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIB0Ad8zKkA7fuvmBzC1-q9w5DeDf0uCv0Jxp0L5JYAQG-qOoDbf3uY23P92Ommim3SgC7dnlIxNPkozRyUTPlx5BCBHw33upBEyu7ljvznDYyFiTdfx0nNWX3O6EtR34UB_BKQhusRKwl4662RG0-8kNRrsNfjoOCijPNlmjj4XNWVwIQxpEFVw22_X4L00KnxikrtFckhjwDYdWaHCHNVAkhMQ5ioCJSOk0Gv1QYcnVh1qL7GCfcsNIugn9TD1B-iNC13aIyMbc"
              alt="Trophy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-white text-black px-2 py-0.5 font-sans font-bold text-[10px] uppercase mb-2 inline-block">Highlight</span>
              <h4 className="font-display text-3xl text-white uppercase leading-none">The Trophy Moment</h4>
            </div>
          </div>
        </div>

        <div className="md:col-span-12 mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { id: "01", title: "Unrivaled Speed", desc: "Elite conditioning and rapid transition play define our court dominance." },
            { id: "02", title: "Precision Form", desc: "Methodical training routines ensuring championship-grade execution." },
            { id: "03", title: "Aggressive Defense", desc: "Shutting down opponents with high-pressure structural discipline." },
            { id: "04", title: "Spartan Grit", desc: "Mental toughness that transforms pressure into championship victory." }
          ].map((stat) => (
            <div key={stat.id} className="border-t-2 border-white/20 pt-4">
              <span className="font-display text-8xl text-white/10 block leading-none select-none">{stat.id}</span>
              <h5 className="font-sans font-bold text-[#ffb4a8] uppercase -mt-10 tracking-widest">{stat.title}</h5>
              <p className="font-sans text-[#ebbbb4]/70 text-sm mt-2">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 glass-card p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb4a8]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-5xl md:text-6xl text-white uppercase italic leading-none mb-6">Capture the <span className="text-[#ffb4a8]">Grit</span></h2>
            <p className="font-sans text-lg text-[#ebbbb4]/70 mb-8">Got footage from the stands or practice? Contribute your media to the Elite Vault and become part of the Spartans legacy.</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#ffb4a8] text-[#690100] font-sans font-bold text-xs tracking-widest px-10 py-4 uppercase flex items-center gap-2 hover:bg-white hover:text-black transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Upload Media
              </button>
              <button className="border border-white text-white font-sans font-bold text-xs tracking-widest px-10 py-4 uppercase hover:bg-white hover:text-black transition-all">
                Review Guidelines
              </button>
            </div>
          </div>
          <div className="hidden md:block opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
