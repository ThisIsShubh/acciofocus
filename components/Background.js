import React from "react";
import { getYoutubeId } from "../helpers/youtube";
export default function Background({ youtubeBg, youtubeIframeRef, bg }) {
    return (
        <>
            {youtubeBg ? (
                <div className="absolute inset-0 w-full h-full z-0">
                    <iframe
                        ref={youtubeIframeRef}
                        src={`https://www.youtube.com/embed/${getYoutubeId(youtubeBg)}?autoplay=1&controls=0&loop=1&playlist=${getYoutubeId(youtubeBg)}&modestbranding=1&rel=0&enablejsapi=1`}
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        frameBorder="0"
                        className="w-full h-full absolute inset-0 object-cover"
                        style={{ pointerEvents: 'none' }}
                        title="YouTube Background"
                    />
                </div>
            ) : bg === "gradient" ? (
                <div
                    className="absolute inset-0 w-full h-full z-0"
                    style={{
                        background: "linear-gradient(135deg, #0f2027 0%, #2c7744 25%, #11998e 50%, #38ef7d 75%, #b2f9b9 100%)"
                    }}
                />
            ) : bg.endsWith('.mp4') ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    src={bg.startsWith('/dynamicBg/') ? bg : `/dynamicBg/${bg.replace(/^\/+/,'')}`}
                    onLoadedMetadata={e => {
                        const vid = e.target;
                        if (vid.paused) vid.play();
                    }}
                />
            ) : (
                <div
                    className="absolute inset-0 w-full h-full z-0"
                    style={{
                        backgroundImage: `url(${bg.startsWith('/staticBg/') ? bg : `/staticBg/${bg.replace(/^\/+/,'')}`})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px] z-0"></div>
        </>
    );
}
