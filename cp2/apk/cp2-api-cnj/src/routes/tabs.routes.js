// --- src/routes/tabs.routes.js ---
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons'; // Usaremos Feather para ícones

// Importa as telas existentes das abas
import Home from '../screens/Home';
import Api from '../screens/Api';
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';

// <<< IMPORTA A NOVA TELA "COMO USAR" >>>
import ComoUsar from '../screens/ComoUsar.js'; // Verifique o caminho

// Importa o hook de tema
import { useThemeContext } from '../context/ThemeContext';

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
                    // height: 60, // Pode ajustar altura se necessário com 5 abas
                    // paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10, // Fonte pequena para caber 5 labels
                    marginBottom: 3, // Pouco espaço abaixo do label
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    // Deixa o ícone focado um pouco maior
                    size = focused ? size + 2 : size;

                    // <<< LÓGICA DE ÍCONES ATUALIZADA PARA 5 ABAS >>>
                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'ApiTab') {
                        iconName = 'search';
                    } else if (route.name === 'ComoUsarTab') { // <<< Ícone para Como Usar
                        iconName = 'help-circle';
                    } else if (route.name === 'InfoApiTab') {
                        iconName = 'info'; // Mudei para 'info' para diferenciar da ajuda
                    } else if (route.name === 'GroupInfoTab') {
                        iconName = 'users';
                    } else {
                        iconName = 'circle'; // Padrão
                    }
                    return <Feather name={iconName} size={size} color={color} />;
                },
                headerShown: false,
            })}
            // Ordem das abas
            initialRouteName="HomeTab" // Garante que começa na Home
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

            {/* Aba 3: Como Usar (NOVA) */}
            <Tab.Screen
                name="ComoUsarTab" // Nome único para a rota da tab
                component={ComoUsar} // Aponta para a tela ComoUsar
                options={{
                    tabBarLabel: 'Como Usar', // Label da aba
                }}
            />

            {/* Aba 4: Informações da API */}
            <Tab.Screen
                name="InfoApiTab"
                component={InfoScreen}
                options={{
                    tabBarLabel: 'Info API',
                }}
            />

            {/* Aba 5: Sobre a Equipe */}
            <Tab.Screen
                name="GroupInfoTab"
                component={GroupInfoScreen}
                options={{
                    tabBarLabel: 'Sobre',
                }}
            />

        </Tab.Navigator>
    );
}