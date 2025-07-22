// Custom hook for background state
import { useState } from "react";

const DEFAULT_BG = "gradient";

export function useBackground() {
    const [bg, setBg] = useState(DEFAULT_BG);
    const [bgTab, setBgTab] = useState('static');
    return { bg, setBg, bgTab, setBgTab };
}
