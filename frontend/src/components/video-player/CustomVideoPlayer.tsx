'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';

interface CustomPlayerProps {
  url: string;
}

export default function CustomVideoPlayer({ url }: CustomPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        // Catch AbortError to prevent Next.js red screen crashes
        videoRef.current.play().catch((err) => {
          console.warn('Video play interrupted or failed:', err);
          setPlaying(false);
        });
      }
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current && duration > 0) {
      setPlayed(videoRef.current.currentTime / duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed(value);
    if (videoRef.current) {
      videoRef.current.currentTime = value * duration;
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setMuted(value === 0);
    if (videoRef.current) {
      videoRef.current.volume = value;
      videoRef.current.muted = value === 0;
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (playing) setShowControls(false);
  };

  // Keyboard Shortcuts (Space, F, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, muted, duration]);

  // Sync initial volume and mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, []);

  // HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (url.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30, // Tối ưu hóa buffer
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS Manifest loaded');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Dành cho Safari hỗ trợ native HLS
      video.src = url;
    } else {
      // Fallback MP4
      video.src = url;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black group flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 z-10" onClick={togglePlay}></div>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
      />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent pb-1 px-4 transition-opacity z-20 pointer-events-none"
          >
            {/* Vùng điều khiển */}
            <div className="w-full pointer-events-auto flex flex-col">
              {/* Progress Bar */}
              <div className="w-full flex items-center h-4 cursor-pointer group/progress mb-1">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none outline-none group-hover/progress:h-1.5 transition-all
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:opacity-0 group-hover/progress:[&::-webkit-slider-thumb]:opacity-100"
                  style={{
                    background: `linear-gradient(to right, #dc2626 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%)`
                  }}
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-neutral-300">
                    {playing ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
                  </button>
                  
                  <div className="flex items-center gap-2 group/volume">
                    <button onClick={toggleMute} className="text-white hover:text-neutral-300">
                      {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300
                        h-1 bg-white/30 rounded-full appearance-none outline-none
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                        [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                      style={{
                        background: `linear-gradient(to right, white ${muted ? 0 : volume * 100}%, rgba(255,255,255,0.3) ${muted ? 0 : volume * 100}%)`
                      }}
                    />
                  </div>

                  <span className="text-white text-xs font-medium ml-2 select-none">
                    {formatTime(played * duration)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="text-white hover:text-neutral-300">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button onClick={toggleFullScreen} className="text-white hover:text-neutral-300">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
