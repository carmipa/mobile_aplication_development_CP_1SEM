// --- src/routes/index.js ---
import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import DrawerRoutes from './drawer.routes'; // Define Drawer como navegador raiz

// Este componente configura o container e aplica o tema base do sistema
export default function Routes() {
    const scheme = useColorScheme(); // Pega o tema do sistema (light/dark)
    const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme; // Define o tema base

    return (
        <NavigationContainer theme={navigationTheme}>
            {/* Renderiza o Drawer como conteúdo principal */}
            <DrawerRoutes />
        </NavigationContainer>
    );
}