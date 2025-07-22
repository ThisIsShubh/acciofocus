import { useState, useRef, useEffect } from "react";
const sounds = ["rain", "cafe", "forest", "fireplace", "ocean", "piano"];
export function useAmbientSound(isMuted) {
    const [ambientVolumes, setAmbientVolumes] = useState({
        rain: 0.0,
        cafe: 0.0,
        forest: 0.0,
        fireplace: 0.0,
        ocean: 0.0,
        piano: 0.0
    });
    const audioRefs = useRef({});
    useEffect(() => {
        sounds.forEach(sound => {
            const ref = audioRefs.current[sound];
            if (ref) {
                ref.loop = false;
                ref.volume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                ref.onended = null;
                if (ambientVolumes[sound] > 0 && !isMuted) {
                    if (ref.paused) {
                        ref.currentTime = 0;
                        ref.play();
                    }
                    ref.onended = () => {
                        const originalVolume = ambientVolumes[sound] * (isMuted ? 0 : 1);
                        let fadeSteps = 5;
                        let fadeOut = setInterval(() => {
                            if (ref.volume > 0.01) {
                                ref.volume = Math.max(0, ref.volume - originalVolume / fadeSteps);
                            } else {
                                clearInterval(fadeOut);
                                ref.currentTime = 0;
                                ref.play().then(() => {
                                    let fadeInStep = 0;
                                    let fadeIn = setInterval(() => {
                                        fadeInStep++;
                                        ref.volume = Math.min(originalVolume, (fadeInStep / fadeSteps) * originalVolume);
                                        if (fadeInStep >= fadeSteps) clearInterval(fadeIn);
                                    }, 30);
                                });
                            }
                        }, 30);
                    };
                } else {
                    ref.pause();
                    ref.currentTime = 0;
                }
            }
        });
    }, [ambientVolumes, isMuted]);
    return { ambientVolumes, setAmbientVolumes, audioRefs };
}
