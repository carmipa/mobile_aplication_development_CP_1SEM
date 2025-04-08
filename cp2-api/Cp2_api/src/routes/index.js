import React from 'react';
import { useColorScheme } from 'react-native'; // ✅ IMPORTANTE
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import DrawerRoutes from './drawer.routes'; // ou onde estão suas rotas

export default function App() {
    const scheme = useColorScheme(); // ✅ PEGA O TEMA DO SISTEMA (light/dark)

    return (
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            {/* ✅ APLICA O TEMA AUTOMÁTICO */}
            <DrawerRoutes />
        </NavigationContainer>
    );
}