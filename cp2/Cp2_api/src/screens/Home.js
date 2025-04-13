import { StyleSheet, Text, View, Button } from "react-native";

// 1. Importe o hook do contexto
import { useThemeContext } from "../context/ThemeContext"; // <-- VERIFIQUE O CAMINHO

export default function Home({ navigation }) {
    // 2. Use o hook para obter o tema
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // 3. Crie uma função para gerar estilos dinâmicos ou defina-os aqui
    //    (Vamos definir diretamente para simplicidade neste caso)
    const containerStyle = {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1c1c1c' : '#ffffff', // Fundo dinâmico
    };

    const titleStyle = {
        fontSize: 24,
        marginBottom: 20,
        color: isDarkMode ? '#ffffff' : '#000000', // Cor do texto dinâmica
    };

    // Nota: O estilo do Button padrão é limitado. Ele deve se adaptar um pouco
    //       automaticamente, mas para controle fino, use Pressable/TouchableOpacity.
    const buttonTitleColor = isDarkMode ? '#66bfff' : '#007bff'; // Cor para o texto do botão (se o Button padrão permitir)

    return (
        // 4. Aplique os estilos dinâmicos
        <View style={containerStyle}>
            <Text style={titleStyle}>Bem-vindo à Home</Text>
            <Button
                title="Ir para API"
                onPress={() => navigation.navigate('Api')}
                color={buttonTitleColor} // A prop 'color' no Button afeta o texto (principalmente Android) ou o tint (iOS)
            />
        </View>
    );
}

// Estilos que NÃO dependem do tema podem permanecer no StyleSheet.create
// (Neste caso, não sobrou nenhum, mas em componentes maiores poderia ter)
// const staticStyles = StyleSheet.create({
//     someStaticElement: {
//         padding: 10,
//     }
// });