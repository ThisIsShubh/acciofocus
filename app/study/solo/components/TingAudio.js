// Ting sound for session end
import React from "react";

export default function TingAudio({ tingRef }) {
    return <audio ref={tingRef} src="/ting.mp3" preload="auto" />;
}
