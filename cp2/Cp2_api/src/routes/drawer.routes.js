import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import Home from "../screens/Home";
import Api from "../screens/Api";
import BuscaNome from "../screens/BuscaNome";

// 1. Importe o hook do seu contexto de tema
import { useThemeContext } from "../context/ThemeContext"; // <-- VERIFIQUE SE ESTE CAMINHO ESTÁ CORRETO

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    // 2. Use o hook para obter o tema atual dentro do componente
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // 3. Defina as cores dinamicamente com base no tema
    //    (Você pode ajustar essas cores para combinar melhor com seu design)
    const activeColor = isDarkMode ? '#66bfff' : '#007bff'; // Ex: Azul claro no escuro, Azul padrão no claro
    const inactiveColor = isDarkMode ? '#aaa' : '#555';    // Ex: Cinza claro no escuro, Cinza escuro no claro
    const drawerBackgroundColor = isDarkMode ? '#1c1c1c' : '#ffffff'; // Ex: Fundo quase preto no escuro, Branco no claro
    const headerColor = isDarkMode ? '#1c1c1c' : '#ffffff'; // Cor de fundo para o cabeçalho (opcional)
    const headerTextColor = isDarkMode ? '#ffffff' : '#000000'; // Cor do texto/ícones do cabeçalho (opcional)


    return (
        <Drawer.Navigator
            screenOptions={{
                // Estilos gerais que não dependem diretamente do tema (ou que você quer manter fixos)
                drawerLabelStyle: {
                    fontSize: 16,
                    marginLeft: -10,
                },

                // --- Cores dinâmicas aplicadas ---
                drawerActiveTintColor: activeColor,    // Cor para texto/ícone do item ativo
                drawerInactiveTintColor: inactiveColor,  // Cor para texto/ícone dos itens inativos
                drawerStyle: {                        // Estilo do container do drawer
                    backgroundColor: drawerBackgroundColor,
                },

                // Opcional: Ajustar cores do cabeçalho (header) para consistência
                // headerStyle: {
                //     backgroundColor: headerColor,
                // },
                // headerTintColor: headerTextColor, // Cor do título e botão de voltar no header

            }}
        >
            {/* As definições das telas permanecem as mesmas */}
            {/* O 'color' passado para drawerIcon agora usará activeColor/inactiveColor */}
            <Drawer.Screen
                name="Home"
                component={Home}
                options={{
                    drawerLabel: 'Página Inicial',
                    drawerIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Api"
                component={Api}
                options={{
                    drawerLabel: 'Busca por número de processo',
                    drawerIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="BuscaNome"
                component={BuscaNome}
                options={{
                    drawerLabel: 'Busca por nome da parte',
                    drawerIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} />
                    ),
                }}
            />
            {/* ... adicione outras telas se necessário ... */}
        </Drawer.Navigator>
    );
}