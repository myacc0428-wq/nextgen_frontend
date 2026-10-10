import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { ArrowLeft, Film, LoaderCircle, Play } from "lucide-react";
import { apiRequest, type Drama } from "../../lib/api";
import "./customer-premium.css";
import "./DramaPage.css";

type Props = { dramaId: string; accessToken?: string; onBack: () => void };

export default function DramaPage({ dramaId, accessToken, onBack }: Props) {
  const [drama, setDrama] = useState<Drama | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void apiRequest<Drama>(`/api/dramas/${encodeURIComponent(dramaId)}`, {}, accessToken)
      .then((item) => { if (active) setDrama(item); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load this drama."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, dramaId]);

  useEffect(() => {
    const video = videoRef.current;
    const source = drama?.url?.trim();
    if (!video || !source) return;

    const isHls = /\.m3u8(?:$|\?)/i.test(source);
    let hls: Hls | null = null;
    const startAutoplay = () => {
      video.muted = true;
      void video.play().catch(() => {
        // Autoplay can still be blocked by the browser; the native controls remain available.
      });
    };

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false, capLevelToPlayerSize: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, startAutoplay);
    } else {
      video.src = source;
      video.addEventListener("loadedmetadata", startAutoplay, { once: true });
      video.addEventListener("canplay", startAutoplay, { once: true });
    }

    return () => {
      hls?.destroy();
      video.removeEventListener("loadedmetadata", startAutoplay);
      video.removeEventListener("canplay", startAutoplay);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [drama?.url]);

  return <main className="cg-shell cg-drama-page">
    <div className="cg-drama-page-inner">
      <button type="button" className="cg-drama-back" onClick={onBack}><ArrowLeft size={18} /> Back to CineGen</button>
      {loading && <div className="cg-page-empty"><LoaderCircle className="gate-spin" size={34} /><p>Loading drama...</p></div>}
      {!loading && error && <div className="cg-page-empty"><Film size={34} /><h2>Drama unavailable</h2><p>{error}</p><button type="button" className="cg-drama-back" onClick={onBack}>Return to library</button></div>}
      {!loading && !error && drama && <article className="cg-drama-detail"><div className="cg-drama-video-wrap"><video ref={videoRef} autoPlay muted controls playsInline preload="metadata" controlsList="nodownload" aria-label={drama.name} /></div><div className="cg-drama-copy"><span className="cg-drama-eyebrow">CINEGEN DRAMA</span><h1>{drama.name}</h1><p>{drama.description}</p><button type="button" className="cg-drama-play" onClick={() => { const video = videoRef.current; if (video) { video.muted = false; void video.play(); } }}><Play size={17} fill="currentColor" /> Play with sound</button></div></article>}
    </div>
  </main>;
}
