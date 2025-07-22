import React from "react";
const sounds = ["rain", "cafe", "forest", "fireplace", "ocean", "piano"];
export default function AmbientAudio({ audioRefs }) {
    return (
        <>
            {sounds.map((sound) => (
                <audio
                    key={sound}
                    ref={el => (audioRefs.current[sound] = el)}
                    src={`/sounds/${sound}.mp3`}
                    preload="auto"
                    style={{ display: 'none' }}
                />
            ))}
        </>
    );
}
