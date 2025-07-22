import { useState, useEffect, useRef } from "react";
export function useMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        if (!menuOpen) return;
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);
    return { menuOpen, setMenuOpen, menuRef };
}
export function useRightMenu() {
    const [rightMenuOpen, setRightMenuOpen] = useState(false);
    const rightMenuRef = useRef(null);
    useEffect(() => {
        if (!rightMenuOpen) return;
        function handleClick(e) {
            if (rightMenuRef.current && !rightMenuRef.current.contains(e.target)) {
                setRightMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [rightMenuOpen]);
    return { rightMenuOpen, setRightMenuOpen, rightMenuRef };
}
