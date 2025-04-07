import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import Home from "../screens/Home";
import Api from "../screens/Api";

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
    return (
        <Drawer.Navigator screenOptions={{ title: '' }}>
            <Drawer.Screen
                name="Home"
                component={Home}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="Api"
                component={Api}
                options={{
                    drawerIcon: ({ color, size }) => (
                        <Feather name="server" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
