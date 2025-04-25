// --- src/routes/drawer.routes.js --- (Adicionando BuscaFiltro)
import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons"; // Usa Feather para ícones

// Importa o componente das Tabs
import BottomTabRoutes from "./tabs.routes";

// Importa as telas
import Api from "../screens/Api";             // Tela de Busca Processual Geral
import ApiStf from '../screens/ApiStf';       // Tela de Busca STF (via CNJ _search)
import BuscaFiltro from '../screens/BuscaFiltro'; // <<< Importa a nova tela BuscaFiltro.js
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import ComoUsar from '../screens/ComoUsar.js';


import { useThemeContext } from "../context/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Definição de cores
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
            initialRouteName="MainTabs"
        >
            {/* 1. Principal (Abas) */}
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabRoutes}
                options={{ drawerLabel: 'Principal (Abas)', title: 'Consultas App', drawerIcon: ({ color, size }) => (<Feather name="grid" size={size} color={color} />), }}
                listeners={({ navigation, route }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('MainTabs', { screen: 'HomeTab' }); }, })}
            />

            {/* 2. Busca por Processo (Geral CNJ) */}
            <Drawer.Screen
                name="ApiDrawer" // Rota da tela original
                component={Api}   // Componente Api.js original
                options={{
                    drawerLabel: 'Busca Processo (Geral)', // Label ajustado
                    title: 'Busca Processual',
                    drawerIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} />
                    ),
                }}
            />

            {/* 3. Busca STF (via CNJ _search) */}
            <Drawer.Screen
                name="ApiStfDrawer" // Nome da ROTA
                component={ApiStf}  // Componente ApiStf.js
                options={{
                    drawerLabel: 'Busca STF (CNJ)', // Texto no menu
                    title: 'Busca Processo STF', // Título no Header
                    drawerIcon: ({ color, size }) => (
                        <Feather name="shield" size={size} color={color} /> // Ícone escudo
                    ),
                }}
            />

            {/* --- 4. ADICIONADO: Busca Avançada (Filtros) --- */}
            <Drawer.Screen
                name="BuscaFiltroDrawer" // Novo nome de ROTA único
                component={BuscaFiltro} // Componente BuscaFiltro.js
                options={{
                    drawerLabel: 'Busca Avançada (Filtros)', // Texto no menu
                    title: 'Busca Avançada',            // Título no Header
                    drawerIcon: ({ color, size }) => (
                        <Feather name="filter" size={size} color={color} /> // Ícone de filtro
                    ),
                }}
            />
            {/* --- FIM DA ADIÇÃO --- */}


            {/* 5. Como Usar o App (era 4) */}
            <Drawer.Screen
                name="HowToUseDrawer"
                component={ComoUsar}
                options={{
                    drawerLabel: 'Como Usar', title: 'Como Usar o App',
                    drawerIcon: ({ color, size }) => (<Feather name="help-circle" size={size} color={color} />),
                }}
            />

            {/* 6. Sobre a API (era 5) */}
            <Drawer.Screen
                name="InfoApiDrawer"
                component={InfoScreen}
                options={{ drawerLabel: 'Sobre a API DataJud', title: 'API DataJud', drawerIcon: ({ color, size }) => (<Feather name="info" size={size} color={color} />), }}
            />

            {/* 7. Equipe e Projeto (era 6) */}
            <Drawer.Screen
                name="GroupInfoDrawer"
                component={GroupInfoScreen}
                options={{ drawerLabel: 'Equipe e Projeto', title: 'Sobre', drawerIcon: ({ color, size }) => (<Feather name="users" size={size} color={color} />), }}
            />

        </Drawer.Navigator>
    );
}