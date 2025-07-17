import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightmode, darkmode } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme(); // pega do sistema
    console.log("tema do sistema: " + systemScheme);
    const [themeName, setThemeName] = useState(systemScheme); // 'light' ou 'dark'

    useEffect(() => {
        setThemeName(systemScheme); // atualiza com o sistema, se quiser
    }, [systemScheme]);

    const theme = themeName === 'dark' ? darkmode : lightmode;

    const toggleTheme = () => {
        setThemeName(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);