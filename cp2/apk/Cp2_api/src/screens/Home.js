// --- src/screens/Home.js ---
// VERSÃO SIMPLIFICADA E CORRETA (usando require direto)

import React from 'react'; // Não precisa mais de useState/useEffect aqui
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground, // Mantém o ImageBackground
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from "../context/ThemeContext";

// <<< Importa diretamente usando require - Caminho confirmado como correto >>>
const backgroundImage = require('../../assets/julgamento2.jpg');

export default function Home({ navigation }) {

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    // Não precisa mais passar isLoadingAsset para os estilos
    const styles = getThemedStyles(isDarkMode);

    // --- Função de Navegação ---
    const goToApiSearch = () => {
        navigation.navigate('ApiTab');
    };

    return (
        // <<< Usa require diretamente no source >>>
        <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            style={styles.imageBackground}
            // onError pode ser mantido para debug, se quiser
            onError={(error) => console.error("Erro no ImageBackground:", error.nativeEvent.error)}
        >
            {/* Overlay semitransparente */}
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Conteúdo da tela (header, content) como antes */}
                    <View style={styles.header}>
                        <Feather name="briefcase" size={48} color={styles.headerContentColor} />
                        <Text style={[styles.title, { color: styles.headerContentColor }]}>Consultas CNJ</Text>
                        <Text style={[styles.subtitle, { color: styles.headerContentColor }]}>
                            Acesse informações processuais de forma simplificada.
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={goToApiSearch}
                            activeOpacity={0.7}
                        >
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
// (Não precisa mais do parâmetro isLoadingAsset)
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f4f7fc'; // Cor de fundo fallback
    const overlayColor = 'rgba(0, 0, 0, 0.5)';
    const headerContentColor = '#FFFFFF';
    const ctaButtonBackgroundColor = isDark ? '#66bfff' : '#007bff';
    const ctaButtonTextColor = '#ffffff';

    return StyleSheet.create({
        imageBackground: {
            flex: 1,
            backgroundColor: backgroundColor, // Mantém fallback
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
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 30,
            backgroundColor: 'transparent',
        },
        header: {
            alignItems: 'center',
            marginBottom: 40,
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: headerContentColor,
            marginTop: 15,
            marginBottom: 5,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
        },
        subtitle: {
            fontSize: 16,
            color: headerContentColor,
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
            color: ctaButtonTextColor,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        // Exporta cores
        headerContentColor: headerContentColor,
        iconColor: headerContentColor, // Renomeado no getThemedStyles anterior, mantendo consistência
        // Não precisa mais de loadingColor
    });
}