"use client";
import { Play } from "lucide-react";
import { useState } from "react";
import type { YouTubeVideo } from "@/lib/youtube";

// The YouTube player (and its cookies) only loads after the visitor presses play.
export function YouTubeReview({ video, title }: { video: YouTubeVideo; title: string }) {
  const [playing, setPlaying] = useState(false);
  return <div className={`reference-review-video ${video.vertical ? "reference-review-video-vertical" : ""}`}>
    {playing
      ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
      : <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
          <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" width={480} height={360}/>
          <span className="reference-review-play"><Play size={22} fill="currentColor" aria-hidden="true"/></span>
        </button>}
  </div>;
}
