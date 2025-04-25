// --- src/routes/tabs.routes.js ---
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons'; // Ionicons já estava importado

// Importa as telas para as abas
import Home from '../screens/Home';
import Api from '../screens/Api';
import ComoUsar from '../screens/ComoUsar'; // <<< IMPORTAR ComoUsar >>>
import FavoritosScreen from '../screens/FavoritosScreen';
import InfoScreen from '../screens/InfoScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';

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
                    // height: 60, // Ajuste se necessário
                },
                tabBarLabelStyle: {
                    fontSize: 10, // Mantém fonte pequena
                    marginBottom: 3,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let IconComponent = Feather; // Usa Feather por padrão
                    size = focused ? size + 1 : size;

                    // <<< LÓGICA DE ÍCONES ATUALIZADA >>>
                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'ApiTab') {
                        iconName = 'search';
                    } else if (route.name === 'FavoritosTab') {
                        IconComponent = Ionicons; // Muda para Ionicons para Favoritos
                        iconName = focused ? 'star' : 'star-outline';
                    } else if (route.name === 'ComoUsarTab') { // <<< ADICIONADO: Condição para Como Usar >>>
                        iconName = 'help-circle'; // Ícone de ajuda (Feather)
                    } else if (route.name === 'InfoApiTab') {
                        iconName = 'info';
                    } else if (route.name === 'GroupInfoTab') {
                        iconName = 'users';
                    } else {
                        iconName = 'circle'; // Ícone padrão
                    }
                    // Renderiza o componente de ícone correto
                    return <IconComponent name={iconName} size={size} color={color} />;
                },
                headerShown: false, // Mantém sem cabeçalho aqui
            })}
            initialRouteName="HomeTab" // Começa na Home
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

            {/* Aba 3: Favoritos */}
            <Tab.Screen
                name="FavoritosTab"
                component={FavoritosScreen}
                options={{ tabBarLabel: 'Favoritos' }}
            />

            {/* <<< Aba 4: COMO USAR (ADICIONADA) >>> */}
            <Tab.Screen
                name="ComoUsarTab"         // Nome da rota para a aba
                component={ComoUsar}       // Componente da tela importado
                options={{
                    tabBarLabel: 'Como Usar', // Rótulo da aba
                }}
            />

            {/* Aba 5: Informações da API (era 4) */}
            <Tab.Screen
                name="InfoApiTab"
                component={InfoScreen}
                options={{ tabBarLabel: 'Info API' }}
            />

            {/* Aba 6: Sobre a Equipe (era 5) */}
            <Tab.Screen
                name="GroupInfoTab"
                component={GroupInfoScreen}
                options={{ tabBarLabel: 'Sobre' }}
            />

        </Tab.Navigator>
    );
}