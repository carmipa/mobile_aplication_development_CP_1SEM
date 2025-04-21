// --- src/routes/drawer.routes.js ---
import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";

// Importa o componente das Tabs
import BottomTabRoutes from "./tabs.routes";

// Importa as telas para links diretos e info
import Api from "../screens/Api";
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';

import { useThemeContext } from "../context/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

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
            {/* 1. Item: Principal (Abas) --- COM LISTENER --- */}
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabRoutes}
                options={{
                    drawerLabel: 'Principal (Abas)',
                    title: 'Consultas App',
                    drawerIcon: ({ color, size }) => (<Feather name="grid" size={size} color={color} />),
                }}
                // <<< ADICIONADO LISTENERS >>>
                listeners={({ navigation, route }) => ({
                    // Executa quando o item do drawer é pressionado
                    drawerItemPress: (e) => {
                        // Previne a ação padrão de navegação (que só iria para 'MainTabs')
                        e.preventDefault();
                        // Navega explicitamente para a rota 'MainTabs',
                        // e dentro dela, para a tela inicial 'HomeTab'.
                        // Isso garante que sempre volte para a Home ao clicar no Drawer.
                        navigation.navigate('MainTabs', { screen: 'HomeTab' });
                    },
                })}
                // <<< FIM DO LISTENERS >>>
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
                    drawerLabel: 'Sobre a API DataJud',
                    title: 'API DataJud',
                    drawerIcon: ({ color, size }) => (<Feather name="info" size={size} color={color} />),
                }}
            />

            {/* 4. Item: Equipe e Projeto */}
            <Drawer.Screen
                name="GroupInfoDrawer"
                component={GroupInfoScreen}
                options={{
                    drawerLabel: 'Equipe e Projeto',
                    title: 'Sobre',
                    drawerIcon: ({ color, size }) => ( <Feather name="users" size={size} color={color} /> ),
                }}
            />

        </Drawer.Navigator>
    );
}