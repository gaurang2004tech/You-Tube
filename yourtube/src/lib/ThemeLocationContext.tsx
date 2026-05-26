"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface ThemeLocationType {
    isSouthIndia: boolean;
    isDarkTheme: boolean;
    isLoading: boolean;
}

const ThemeLocationContext = createContext<ThemeLocationType>({
    isSouthIndia: false,
    isDarkTheme: false,
    isLoading: true,
});

const SOUTH_INDIAN_STATES = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
];

export const ThemeLocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSouthIndia, setIsSouthIndia] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLocationAndSetTheme = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
                // Fetch location data
                const response = await fetch("https://ipinfo.io/json", { signal: controller.signal });
                const data = await response.json();
                clearTimeout(timeoutId);

                const region = data.region; // ipinfo.io uses "region" for state
                const _isSouth = SOUTH_INDIAN_STATES.includes(region);
                setIsSouthIndia(_isSouth);

                // Calculate current IST hour (UTC + 5:30)
                const now = new Date();
                const istTime = new Date(
                    now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 60 * 60 * 1000
                );
                const hour = istTime.getHours(); // 0 to 23
                const isTimeSlot = hour >= 10 && hour < 12;

                // Logic: South India AND 10-12 => Light Theme, Else => Dark Theme
                if (_isSouth && isTimeSlot) {
                    setIsDarkTheme(false);
                } else {
                    setIsDarkTheme(true);
                }
            } catch (error) {
                console.error("Failed to fetch location", error);
                // Fallback to dark theme on error
                setIsDarkTheme(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocationAndSetTheme();
    }, []);

    // Update body class based on theme
    useEffect(() => {
        if (!isLoading) {
            const root = window.document.documentElement;
            if (isDarkTheme) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    }, [isDarkTheme, isLoading]);

    return (
        <ThemeLocationContext.Provider value={{ isSouthIndia, isDarkTheme, isLoading }}>
            {children}
        </ThemeLocationContext.Provider>
    );
};

export const useThemeLocation = () => useContext(ThemeLocationContext);
