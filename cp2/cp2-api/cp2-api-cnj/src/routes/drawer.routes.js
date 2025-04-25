// --- src/routes/drawer.routes.js ---
import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather, Ionicons } from "@expo/vector-icons"; // Importa Ionicons

// Importa o componente das Tabs
import BottomTabRoutes from "./tabs.routes";

// Importa as telas para links diretos e info
import Api from "../screens/Api"; // Tela de Busca
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import ComoUsar from '../screens/ComoUsar.js';
import FavoritosScreen from '../screens/FavoritosScreen'; // Tela de Favoritos

import { useThemeContext } from "../context/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Cores e estilos
    const activeColor = isDarkMode ? '#66bfff' : '#007bff';
    const inactiveColor = isDarkMode ? '#aaa' : '#555';
    const drawerBackgroundColor = isDarkMode ? '#1c1c1c' : '#ffffff';
    const headerColor = isDarkMode ? '#1c1c1c' : '#ffffff';
    const headerTextColor = isDarkMode ? '#ffffff' : '#000000';

    return (
        <Drawer.Navigator
            screenOptions={{
                drawerLabelStyle: { fontSize: 16, marginLeft: -10 },
                drawerActiveTintColor: activeColor,
                drawerInactiveTintColor: inactiveColor,
                drawerStyle: { backgroundColor: drawerBackgroundColor },
                headerStyle: { backgroundColor: headerColor },
                headerTintColor: headerTextColor,
            }}
            initialRouteName="MainTabs" // Define a tela inicial
        >
            {/* 1. Principal (Abas) */}
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabRoutes}
                options={{ drawerLabel: 'Principal (Abas)', title: 'Consultas App', drawerIcon: ({ color, size }) => (<Feather name="grid" size={size} color={color} />), }}
                // Listener opcional para navegação específica dentro das tabs
                listeners={({ navigation, route }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('MainTabs', { screen: 'HomeTab' }); }, })}
            />

            {/* 2. Busca por Processo (Direto) - CORRETO */}
            <Drawer.Screen
                name="ApiDrawer" // Nome da ROTA
                component={Api}   // Componente CORRETO
                options={{ drawerLabel: 'Busca Processo (Direto)', title: 'Busca por Processo', drawerIcon: ({ color, size }) => (<Feather name="search" size={size} color={color} />), }}
            />

            {/* 3. TELA DE FAVORITOS - CORRETO */}
            <Drawer.Screen
                name="FavoritosDrawer" // Nome da ROTA
                component={FavoritosScreen} // Componente CORRETO
                options={{
                    drawerLabel: 'Processos Favoritos',
                    title: 'Favoritos',
                    drawerIcon: ({ color, size }) => (<Ionicons name="star-outline" size={size} color={color} />),
                }}
            />

            {/* 4. Como Usar o App */}
            <Drawer.Screen
                name="HowToUseDrawer"
                component={ComoUsar}
                options={{
                    drawerLabel: 'Como Usar',
                    title: 'Como Usar o App',
                    drawerIcon: ({ color, size }) => (<Feather name="help-circle" size={size} color={color} />),
                }}
            />

            {/* 5. Sobre a API */}
            <Drawer.Screen
                name="InfoApiDrawer"
                component={InfoScreen}
                options={{ drawerLabel: 'Sobre a API DataJud', title: 'API DataJud', drawerIcon: ({ color, size }) => (<Feather name="info" size={size} color={color} />), }}
            />

            {/* 6. Equipe e Projeto */}
            <Drawer.Screen
                name="GroupInfoDrawer"
                component={GroupInfoScreen}
                options={{ drawerLabel: 'Equipe e Projeto', title: 'Sobre', drawerIcon: ({ color, size }) => (<Feather name="users" size={size} color={color} />), }}
            />

        </Drawer.Navigator>
    );
}