// --- src/screens/Home.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity, // Usado para criar botões customizados
    SafeAreaView // Garante que o conteúdo não fique sob notches/barras
} from "react-native";
import { Feather } from '@expo/vector-icons'; // Para usar ícones
import { useThemeContext } from "../context/ThemeContext"; // Para o tema

export default function Home({ navigation }) {
    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    // Gera os estilos baseados no tema (função no final do arquivo)
    const styles = getThemedStyles(isDarkMode);

    // Função para navegar para a tela de busca
    const goToApiSearch = () => {
        navigation.navigate('ApiTab'); // Navega para a ABA de busca por número
    };

    return (
        // SafeAreaView para evitar sobreposição com barras do sistema
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Seção do Título e Ícone */}
                <View style={styles.header}>
                    <Feather name="briefcase" size={48} color={styles.iconColor} />
                    <Text style={styles.title}>Consultas CNJ</Text>
                    <Text style={styles.subtitle}>
                        Acesse informações processuais de forma simplificada.
                    </Text>
                </View>

                {/* Seção Principal com o Botão de Ação */}
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={goToApiSearch}
                        activeOpacity={0.7} // Efeito ao pressionar
                    >
                        <Feather name="search" size={24} color={styles.ctaButtonText.color} style={{ marginRight: 10 }} />
                        <Text style={styles.ctaButtonText}>Buscar por Número do Processo</Text>
                    </TouchableOpacity>
                </View>

                {/* Rodapé (Opcional - pode adicionar versão ou links) */}
                {/*
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Versão 1.0.0</Text>
                </View>
                */}

            </View>
        </SafeAreaView>
    );
}

// --- Função de Estilos Dinâmicos ---
// Define os estilos baseados no tema (claro ou escuro)
function getThemedStyles(isDark) {
    // Define as cores base
    const backgroundColor = isDark ? '#121212' : '#f4f7fc'; // Fundo um pouco mais suave (light)
    const cardBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; // Cor de fundo para "cards"
    const textColor = isDark ? '#e0e0e0' : '#444455'; // Cor de texto principal
    const titleColor = isDark ? '#ffffff' : '#1a1a2e'; // Cor do título principal
    const subtitleColor = isDark ? '#b0b0b0' : '#6a6a7a'; // Cor do subtítulo/descrição
    const primaryColor = isDark ? '#66bfff' : '#007bff'; // Cor primária (azul)
    const ctaTextColor = '#ffffff'; // Cor do texto no botão principal (branco)
    const iconColor = primaryColor; // Cor dos ícones acompanha a cor primária

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        container: {
            flex: 1,
            justifyContent: 'space-around', // Distribui espaço entre header, content, footer
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 30,
        },
        header: {
            alignItems: 'center',
            marginBottom: 40, // Espaço abaixo do header
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: titleColor,
            marginTop: 15, // Espaço acima do título
            marginBottom: 5, // Espaço abaixo do título
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 16,
            color: subtitleColor,
            textAlign: 'center',
            paddingHorizontal: 20, // Evita que o texto fique muito largo
        },
        content: {
            width: '100%', // Ocupa toda a largura para o botão centralizar
            alignItems: 'center', // Centraliza o botão
        },
        ctaButton: {
            flexDirection: 'row', // Alinha ícone e texto horizontalmente
            alignItems: 'center', // Centraliza ícone e texto verticalmente
            backgroundColor: primaryColor, // Usa a cor primária
            paddingVertical: 18, // Mais padding vertical
            paddingHorizontal: 35, // Mais padding horizontal
            borderRadius: 30, // Bordas bem arredondadas
            elevation: 3, // Sombra (Android)
            shadowColor: '#000', // Sombra (iOS)
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        ctaButtonText: {
            color: ctaTextColor, // Texto branco no botão
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        footer: {
            position: 'absolute', // Posiciona no fundo
            bottom: 20,
        },
        footerText: {
            fontSize: 12,
            color: subtitleColor, // Cor suave para o rodapé
        },
        // Exporta cores para uso inline se necessário (ex: ícone)
        iconColor: iconColor,
    });
}