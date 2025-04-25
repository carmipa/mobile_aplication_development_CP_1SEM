// --- src/screens/Home.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from "../context/ThemeContext";

// Importa a imagem de fundo (usando .png conforme definido)
const backgroundImage = require('../../assets/julgamento2.png');

export default function Home({ navigation }) {

    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    // Agora getThemedStyles retorna apenas o objeto de estilos
    const styles = getThemedStyles(isDarkMode);
    // Obtém a cor diretamente da função para usar no ícone
    // (Alternativa: Poderíamos fazer getThemedStyles retornar um objeto { styles, colors })
    const iconColor = isDarkMode ? '#FFFFFF' : '#1a1a2e'; // Define a cor do ícone aqui baseado no tema

    const goToApiSearch = () => {
        navigation.navigate('ApiTab');
    };

    return (
        <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            style={styles.imageBackground}
            onError={(error) => console.error("Erro no ImageBackground:", error.nativeEvent.error)}
        >
            <View style={styles.overlay} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        {/* Passa a cor do ícone diretamente */}
                        <Feather name="briefcase" size={48} color={iconColor} />
                        {/* Estilos title e subtitle já definem a cor correta */}
                        <Text style={styles.title}>Consulta processual</Text>
                        <Text style={styles.subtitle}>
                            Acesse informações processuais de forma simplificada.
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={goToApiSearch}
                            activeOpacity={0.7}
                        >
                            {/* Cor do ícone do botão vem do estilo do texto */}
                            <Feather name="search" size={24} color={styles.ctaButtonText.color} style={{ marginRight: 10 }} />
                            <Text style={styles.ctaButtonText}>Buscar por Número do Processo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

// --- Função de Estilos Dinâmicos ---
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f4f7fc';
    const overlayColor = 'rgba(0, 0, 0, 0.5)';
    const headerContentColor = '#FFFFFF'; // Cor do texto/ícone no header
    const ctaButtonBackgroundColor = isDark ? '#66bfff' : '#007bff';
    const ctaButtonTextColor = '#ffffff'; // Cor do texto/ícone no botão CTA

    // <<< CORREÇÃO APLICADA AQUI >>>
    // Retorna APENAS o objeto criado pelo StyleSheet.create
    return StyleSheet.create({
        imageBackground: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: overlayColor,
        },
        safeArea: {
            flex: 1,
        },
        container: {
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 100,
            backgroundColor: 'transparent',
        },
        header: {
            alignItems: 'center',
        },
        title: {
            fontSize: 34,
            fontWeight: 'bold',
            color: headerContentColor, // Cor definida aqui
            marginTop: 10,
            marginBottom: 8,
            textAlign: 'center',
            lineHeight: 40,
            letterSpacing: 0.5,
            textShadowColor: 'rgba(0, 0, 0, 0.6)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
        },
        subtitle: {
            fontSize: 16,
            color: headerContentColor, // Cor definida aqui
            textAlign: 'center',
            paddingHorizontal: 20,
            opacity: 0.9,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 1,
        },
        content: {
            width: '100%',
            alignItems: 'center',
        },
        ctaButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: ctaButtonBackgroundColor,
            paddingVertical: 18,
            paddingHorizontal: 35,
            borderRadius: 30,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
        },
        ctaButtonText: {
            color: ctaButtonTextColor, // Cor definida aqui
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        // As linhas abaixo foram REMOVIDAS pois não são estilos válidos aqui
        // headerContentColor: headerContentColor,
        // iconColor: headerContentColor,
    });
    // <<< FIM DA CORREÇÃO >>>
}