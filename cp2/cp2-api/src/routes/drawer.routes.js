// --- src/routes/drawer.routes.js --- (Usando ApiStf.js)
import React from 'react';
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";

// Importa o componente das Tabs
import BottomTabRoutes from "./tabs.routes";

// Importa as telas
import Api from "../screens/Api";             // Tela de Busca Processual Geral
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import ComoUsar from '../screens/ComoUsar.js';
import ApiStf from '../screens/ApiStf'; // <<< Importa a tela ApiStf.js CORRETA

import { useThemeContext } from "../context/ThemeContext";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Cores
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
            <Drawer.Screen name="MainTabs" component={BottomTabRoutes} options={{ drawerLabel: 'Principal (Abas)', title: 'Consultas App', drawerIcon: ({ color, size }) => (<Feather name="grid" size={size} color={color} />), }} listeners={({ navigation, route }) => ({ drawerItemPress: (e) => { e.preventDefault(); navigation.navigate('MainTabs', { screen: 'HomeTab' }); }, })} />

            {/* 2. Busca por Processo (Geral CNJ) */}
            <Drawer.Screen name="ApiDrawer" component={Api} options={{ drawerLabel: 'Busca Processo (Geral)', title: 'Busca Processual', drawerIcon: ({ color, size }) => (<Feather name="search" size={size} color={color} />), }} />

            {/* --- 3. Busca STF (usando ApiStf.js) --- */}
            <Drawer.Screen
                name="ApiStfDrawer"   // Nome da ROTA
                component={ApiStf}  // <<< Componente ApiStf.js CORRETO
                options={{
                    drawerLabel: 'Busca STF (CNJ)', // Texto no menu
                    title: 'Busca Processo STF', // Título no Header
                    drawerIcon: ({ color, size }) => ( <Feather name="shield" size={size} color={color} /> ),
                }}
            />
            {/* --- FIM DA ADIÇÃO --- */}

            {/* 4. Como Usar o App */}
            <Drawer.Screen name="HowToUseDrawer" component={ComoUsar} options={{ drawerLabel: 'Como Usar', title: 'Como Usar o App', drawerIcon: ({ color, size }) => (<Feather name="help-circle" size={size} color={color} />), }} />

            {/* 5. Sobre a API */}
            <Drawer.Screen name="InfoApiDrawer" component={InfoScreen} options={{ drawerLabel: 'Sobre a API DataJud', title: 'API DataJud', drawerIcon: ({ color, size }) => (<Feather name="info" size={size} color={color} />), }} />

            {/* 6. Equipe e Projeto */}
            <Drawer.Screen name="GroupInfoDrawer" component={GroupInfoScreen} options={{ drawerLabel: 'Equipe e Projeto', title: 'Sobre', drawerIcon: ({ color, size }) => (<Feather name="users" size={size} color={color} />), }} />

        </Drawer.Navigator>
    );
}