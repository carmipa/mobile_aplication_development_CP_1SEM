// src/context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const deviceScheme = useColorScheme();
    const [theme, setTheme] = useState('auto'); // 'auto', 'light' ou 'dark'

    const currentTheme = theme === 'auto' ? deviceScheme : theme;

    const cycleTheme = () => {
        // 🔄 Avança o tema em 3 passos: auto → dark → light → auto
        if (theme === 'auto') setTheme('dark');
        else if (theme === 'dark') setTheme('light');
        else setTheme('auto');
    };

    return (
        <ThemeContext.Provider value={{ theme, currentTheme, setTheme, cycleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
export default ThemeProvider;
