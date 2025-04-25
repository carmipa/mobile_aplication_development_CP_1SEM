// --- src/routes/tabs.routes.js ---
// (Sem alterações nesta etapa - Mantendo 5 abas, com Busca STF substituindo a busca geral)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Importa as telas
import Home from '../screens/Home';
// import Api from '../screens/Api'; // Não importa mais Api para as tabs
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import ComoUsar from '../screens/ComoUsar.js';
import ApiStf from '../screens/ApiStf'; // Importa a tela STF

// Importa o hook de tema
import { useThemeContext } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabRoutes() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Definição de cores
    const activeColor = isDarkMode ? '#66bfff' : '#007bff';
    const inactiveColor = isDarkMode ? '#aaa' : '#555';
    const tabBarBackgroundColor = isDarkMode ? '#1c1c1c' : '#ffffff';
    const borderTopColor = isDarkMode ? '#333' : '#ddd';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: { backgroundColor: tabBarBackgroundColor, borderTopColor: borderTopColor, },
                tabBarLabelStyle: { fontSize: 10, marginBottom: 3, },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    size = focused ? size + 2 : size;

                    // Lógica de Ícones (ApiTab agora é STF com ícone 'shield')
                    if (route.name === 'HomeTab') { iconName = 'home'; }
                    else if (route.name === 'ApiTab') { iconName = 'shield'; } // Ícone STF
                    else if (route.name === 'ComoUsarTab') { iconName = 'help-circle'; }
                    else if (route.name === 'InfoApiTab') { iconName = 'info'; }
                    else if (route.name === 'GroupInfoTab') { iconName = 'users'; }
                    else { iconName = 'circle'; }
                    return <Feather name={iconName} size={size} color={color} />;
                },
                headerShown: false,
            })}
            initialRouteName="HomeTab"
        >
            {/* Aba 1: Início */}
            <Tab.Screen name="HomeTab" component={Home} options={{ tabBarLabel: 'Início' }} />

            {/* Aba 2: Busca STF (Substituiu a busca geral) */}
            <Tab.Screen name="ApiTab" component={ApiStf} options={{ tabBarLabel: 'Busca STF' }} />

            {/* Aba 3: Como Usar */}
            <Tab.Screen name="ComoUsarTab" component={ComoUsar} options={{ tabBarLabel: 'Como Usar' }} />

            {/* Aba 4: Informações da API */}
            <Tab.Screen name="InfoApiTab" component={InfoScreen} options={{ tabBarLabel: 'Info API' }} />

            {/* Aba 5: Sobre a Equipe */}
            <Tab.Screen name="GroupInfoTab" component={GroupInfoScreen} options={{ tabBarLabel: 'Sobre' }} />

        </Tab.Navigator>
    );
}
// Nenhuma alteração neste arquivo para incluir BuscaFiltro.js
// A nova tela estará acessível apenas pelo Drawer Menu.