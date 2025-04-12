import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import Home from "../screens/Home";
import Api from "../screens/Api";
import PesquisaAvancada from "../screens/PesquisaAvancada";


const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerLabelStyle: {
                    fontSize: 16,
                    marginLeft: -10, // Ajusta o alinhamento do texto
                },
                drawerActiveTintColor: '#007bff', // Cor do item ativo
                drawerInactiveTintColor: '#555',  // Cor do item inativo
            }}
        >
            <Drawer.Screen
                name="Home"
                component={Home}
                options={{
                    drawerLabel: 'Página Inicial', // 📝 Nome mais amigável para a Home
                    drawerIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Api"
                component={Api}
                options={{
                    drawerLabel: 'Busca por número de processo', // 📝 Nome atualizado para clareza
                    drawerIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} /> // 🔍 Ícone mais apropriado
                    ),
                }}
            />

            <Drawer.Screen
                name="PesquisaAvancada"
                component={PesquisaAvancada}
                options={{
                    drawerLabel: 'Busca avançada', // 📝 Nome atualizado para clareza
                    drawerIcon: ({ color, size }) => (
                        <Feather name="search" size={size} color={color} /> // 🔍 Ícone mais apropriado
                    ),
                }}
            />


        </Drawer.Navigator>
    );
}
