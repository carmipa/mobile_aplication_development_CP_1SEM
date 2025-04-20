// --- src/routes/drawer.routes.js ---
import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";

// Importa o componente das Tabs
import BottomTabRoutes from "./tabs.routes";

// Importa a tela de API para o link direto
import Api from "../screens/Api";

// Importa a tela informativa da API
import InfoScreen from '../screens/InfoScreen';

// <<< IMPORTA A NOVA TELA DE INFORMAÇÕES DO GRUPO >>>
import GroupInfoScreen from '../screens/GroupInfoScreen'; // Verifique o caminho

import { useThemeContext } from "../context/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // ... (definição de cores como antes) ...
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
        >
            {/* 1. Item: Principal (Abas) */}
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabRoutes}
                options={{
                    drawerLabel: 'Principal (Abas)',
                    title: 'Consultas App',
                    drawerIcon: ({ color, size }) => (<Feather name="grid" size={size} color={color} />),
                }}
            />

            {/* 2. Item: Busca por Processo (Direto) */}
            <Drawer.Screen
                name="ApiDrawer"
                component={Api}
                options={{
                    drawerLabel: 'Busca Processo (Direto)',
                    title: 'Busca por Processo',
                    drawerIcon: ({ color, size }) => (<Feather name="search" size={size} color={color} />),
                }}
            />

            {/* 3. Item: Sobre a API */}
            <Drawer.Screen
                name="InfoApiDrawer"
                component={InfoScreen}
                options={{
                    drawerLabel: 'Sobre a API DataJud', // Ajustado Label
                    title: 'API DataJud',
                    drawerIcon: ({ color, size }) => (<Feather name="info" size={size} color={color} />),
                }}
            />

            {/* 4. Item: Equipe e Projeto (NOVO) */}
            <Drawer.Screen
                name="GroupInfoDrawer" // Nome da rota
                component={GroupInfoScreen} // <<< Aponta para a nova tela
                options={{
                    drawerLabel: 'Equipe e Projeto', // Texto no menu
                    title: 'Sobre',               // Título no Header
                    drawerIcon: ({ color, size }) => (
                        <Feather name="users" size={size} color={color} /> // Ícone de usuários
                    ),
                }}
            />

            {/* Adicione outras telas exclusivas do Drawer aqui */}

        </Drawer.Navigator>
    );
}