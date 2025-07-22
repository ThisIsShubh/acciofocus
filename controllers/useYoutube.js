import { useState, useRef, useEffect } from "react";
export function useYoutube(isMuted) {
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeBg, setYoutubeBg] = useState("");
    const [youtubeVolume, setYoutubeVolume] = useState(100);
    const youtubeIframeRef = useRef(null);
    const prevYoutubeVolume = useRef(100);
    useEffect(() => {
        if (!youtubeBg || !youtubeIframeRef.current) return;
        const vol = isMuted ? 0 : youtubeVolume;
        const setVolume = () => {
            youtubeIframeRef.current.contentWindow.postMessage(
                JSON.stringify({
                    event: 'command',
                    func: 'setVolume',
                    args: [vol]
                }),
                '*'
            );
        };
        setVolume();
        const t = setTimeout(setVolume, 800);
        return () => clearTimeout(t);
    }, [youtubeBg, youtubeVolume, isMuted]);
    return {
        youtubeUrl, setYoutubeUrl,
        youtubeBg, setYoutubeBg,
        youtubeVolume, setYoutubeVolume,
        youtubeIframeRef,
        prevYoutubeVolume
    };
}
