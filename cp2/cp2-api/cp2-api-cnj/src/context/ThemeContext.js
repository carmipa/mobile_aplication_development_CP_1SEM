// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

// 1. Cria o Contexto
const ThemeContext = createContext();

// 2. Cria o Componente Provedor (Provider)
const ThemeProvider = ({ children }) => {
    // 3. Obtém o esquema de cores atual do dispositivo ('light', 'dark' ou null)
    const deviceScheme = useColorScheme();

    // 4. Estado para armazenar a preferência do usuário ('auto', 'light', 'dark')
    //    Começa em 'auto' para seguir o sistema por padrão.
    const [themePreference, setThemePreference] = useState('auto'); // Renomeado para clareza

    // 5. Determina o tema REAL a ser usado ('light' ou 'dark')
    //    Se a preferência for 'auto', usa o tema do dispositivo (ou 'light' como fallback se deviceScheme for null).
    //    Caso contrário, usa a preferência definida ('light' ou 'dark').
    const currentTheme = useMemo(() => {
        if (themePreference === 'auto') {
            return deviceScheme || 'light'; // Garante que nunca seja null
        }
        return themePreference;
    }, [themePreference, deviceScheme]);


    // 6. Função para ciclar entre as preferências: auto -> dark -> light -> auto
    const cycleTheme = () => {
        if (themePreference === 'auto') setThemePreference('dark');
        else if (themePreference === 'dark') setThemePreference('light');
        else setThemePreference('auto');
    };

    // 7. O valor fornecido pelo contexto.
    //    Inclui a preferência ('auto', 'light', 'dark'), o tema atual ('light', 'dark'),
    //    e as funções para alterar a preferência.
    //    useMemo otimiza para que o objeto só seja recriado se os valores mudarem.
    const contextValue = useMemo(() => ({
        theme: themePreference, // A configuração escolhida ('auto', 'light', 'dark')
        currentTheme: currentTheme, // O tema efetivo ('light', 'dark')
        setTheme: setThemePreference, // Função para definir a preferência diretamente
        cycleTheme, // Função para ciclar as preferências
    }), [themePreference, currentTheme, cycleTheme, setThemePreference]);


    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// 8. Hook personalizado para facilitar o uso do contexto
export const useThemeContext = () => useContext(ThemeContext);

// 9. Exporta o Provedor como padrão
export default ThemeProvider;