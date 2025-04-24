// --- src/routes/tabs.routes.js ---
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// <<< Importar Ionicons também para o ícone de estrela >>>
import { Feather, Ionicons } from '@expo/vector-icons';

// Importa as telas para as abas
import Home from '../screens/Home';
import Api from '../screens/Api';
// <<< NÃO importa mais ComoUsar aqui (será substituído) >>>
// import ComoUsar from '../screens/ComoUsar.js';
// <<< IMPORTA FavoritosScreen >>>
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
                    // Usa Feather por padrão, mas muda para Ionicons para a estrela
                    let IconComponent = Feather;
                    size = focused ? size + 1 : size; // Pequeno ajuste de tamanho para ícone focado

                    // <<< LÓGICA DE ÍCONES ATUALIZADA >>>
                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'ApiTab') {
                        iconName = 'search';
                        // <<< Aba de Favoritos >>>
                    } else if (route.name === 'FavoritosTab') {
                        IconComponent = Ionicons; // Muda para Ionicons
                        iconName = focused ? 'star' : 'star-outline'; // Estrela preenchida se focada
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
                headerShown: false, // Mantém sem cabeçalho aqui, pois está no Drawer
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

            {/* <<< Aba 3: AGORA É FAVORITOS >>> */}
            <Tab.Screen
                name="FavoritosTab" // Novo nome para a rota da aba
                component={FavoritosScreen} // Novo componente para a aba
                options={{
                    tabBarLabel: 'Favoritos', // Novo rótulo da aba
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