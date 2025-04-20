// --- src/routes/tabs.routes.js ---
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons'; // Usaremos Feather para ícones

// Importa as telas existentes das abas
import Home from '../screens/Home';
import Api from '../screens/Api';

// <<< IMPORTA AS TELAS INFORMATIVAS >>>
import InfoScreen from '../screens/InfoScreen'; // Tela sobre a API
import GroupInfoScreen from '../screens/GroupInfoScreen'; // Tela sobre a Equipe

// Importa o hook de tema
import { useThemeContext } from '../context/ThemeContext'; // Verifique o caminho

const Tab = createBottomTabNavigator();

export default function BottomTabRoutes() {
    // Usa o contexto de tema para estilização
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Definição de cores dinâmicas
    const activeColor = isDarkMode ? '#66bfff' : '#007bff';
    const inactiveColor = isDarkMode ? '#aaa' : '#555';
    const tabBarBackgroundColor = isDarkMode ? '#1c1c1c' : '#ffffff';
    const borderTopColor = isDarkMode ? '#333' : '#ddd';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    backgroundColor: tabBarBackgroundColor,
                    borderTopColor: borderTopColor,
                },
                tabBarLabelStyle: {
                    fontSize: 10, // Pode diminuir um pouco a fonte se tiver muitas abas
                    // marginBottom: 3,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    size = focused ? size * 1.1 : size; // Leve aumento no ícone focado (opcional)

                    // <<< LÓGICA DE ÍCONES ATUALIZADA >>>
                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'ApiTab') {
                        iconName = 'search';
                    } else if (route.name === 'InfoApiTab') { // Ícone para Info API
                        iconName = 'alert-circle'; // Ou 'info' se preferir
                    } else if (route.name === 'GroupInfoTab') { // Ícone para Info Grupo
                        iconName = 'users'; // Ou 'book-open'
                    } else {
                        iconName = 'circle'; // Padrão
                    }
                    return <Feather name={iconName} size={size} color={color} />;
                },
                headerShown: false, // Mantém escondido para usar o header do Drawer
            })}
        >
            {/* Aba 1: Início */}
            <Tab.Screen
                name="HomeTab"
                component={Home}
                options={{ tabBarLabel: 'Início' }}
            />

            {/* Aba 2: Busca por Nº Processo */}
            <Tab.Screen
                name="ApiTab"
                component={Api}
                options={{ tabBarLabel: 'Nº Processo' }}
            />

            {/* Aba 3: Informações da API (NOVA) */}
            <Tab.Screen
                name="InfoApiTab" // Nome único para a rota da tab
                component={InfoScreen} // Aponta para a tela de info da API
                options={{
                    tabBarLabel: 'Info API', // Label curto para a aba
                }}
            />

            {/* Aba 4: Sobre a Equipe (NOVA) */}
            <Tab.Screen
                name="GroupInfoTab" // Nome único para a rota da tab
                component={GroupInfoScreen} // Aponta para a tela de info do grupo
                options={{
                    tabBarLabel: 'Sobre', // Label curto para a aba
                }}
            />

        </Tab.Navigator>
    );
}