// --- src/screens/GroupInfoScreen.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView, // Para permitir rolagem se o conteúdo for grande
    SafeAreaView,
    TouchableOpacity, // Para links clicáveis
    Linking // Para abrir links externos
} from 'react-native';
import { Feather } from '@expo/vector-icons'; // Ícones
import { useThemeContext } from '../context/ThemeContext'; // Tema

// Componente da Tela de Informações do Grupo
export default function GroupInfoScreen({ navigation }) {
    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    const styles = getThemedStyles(isDarkMode); // Estilos dinâmicos (definidos abaixo)

    // Função para abrir links
    const handleLinkPress = (url) => {
        Linking.openURL(url).catch(err => {
            console.error("Não foi possível abrir o link", err);
            Alert.alert("Erro", "Não foi possível abrir o link.");
        });
    };

    // --- Dados do Grupo (Extraídos do Markdown) ---
    const groupMembers = [
        { name: 'Amanda Mesquita Cirino Da Silva', rm: 'RM559177', github: 'https://github.com/mandyy14' },
        { name: 'Journey Tiago Lopes Ferreira', rm: 'RM556071', github: 'https://github.com/JouTiago' },
        { name: 'Paulo André Carminati', rm: 'RM557881', github: 'https://github.com/carmipa' }
    ];

    const projectRepoUrl = 'https://github.com/carmipa/mobile_aplication_development_CP_1SEM/tree/main/cp2/Cp2_api';
    const presentationDate = '25 de abril de 2025';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>

                    {/* Título da Tela */}
                    <View style={styles.headerSection}>
                        <Feather name="info" size={30} color={styles.headerIconColor} />
                        <Text style={styles.mainTitle}>Sobre o Projeto e Equipe</Text>
                    </View>

                    {/* Informações do Projeto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projeto</Text>
                        <Text style={styles.projectTitle}>Checkpoint 2 - Mobile {presentationDate.substring(presentationDate.length - 4)}</Text>
                        <Text style={styles.text}>Aplicativo de consulta processual utilizando a API Pública DataJud do CNJ.</Text>
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => handleLinkPress(projectRepoUrl)}
                        >
                            <Feather name="github" size={18} color={styles.linkColor} style={{ marginRight: 5 }}/>
                            <Text style={styles.linkText}>Ver Repositório do Projeto</Text>
                        </TouchableOpacity>
                        <Text style={styles.presentationDate}>
                            Data da Apresentação: {presentationDate}
                        </Text>
                    </View>

                    {/* Membros do Grupo */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Equipe de Desenvolvimento</Text>
                        {groupMembers.map((member, index) => (
                            <View key={index} style={styles.memberCard}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberRm}>RM: {member.rm}</Text>
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => handleLinkPress(member.github)}
                                >
                                    <Feather name="github" size={16} color={styles.linkColor} style={{ marginRight: 5 }} />
                                    <Text style={styles.linkText}>Perfil GitHub</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Função de Estilos Dinâmicos ---
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f4f7fc';
    const cardBackgroundColor = isDark ? '#1e1e1e' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#444455';
    const titleColor = isDark ? '#ffffff' : '#1a1a2e';
    const sectionTitleColor = isDark ? '#bbdffd' : '#003366'; // Cor para títulos de seção
    const linkColor = isDark ? '#66bfff' : '#007bff'; // Cor dos links
    const borderColor = isDark ? '#333' : '#e0e0e0'; // Cor das bordas

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        scrollViewContainer: {
            flexGrow: 1, // Permite que o ScrollView cresça
        },
        container: {
            flex: 1,
            padding: 25,
        },
        headerSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30,
            justifyContent: 'center', // Centraliza título e ícone
        },
        mainTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: titleColor,
            textAlign: 'center',
            marginLeft: 10, // Espaço entre ícone e título
        },
        headerIconColor: titleColor, // Usa a mesma cor do título principal para o ícone do header
        section: {
            marginBottom: 30, // Espaço entre seções
            padding: 20,
            backgroundColor: cardBackgroundColor,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: borderColor,
            shadowColor: "#000", // Sombra leve
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.2 : 0.08,
            shadowRadius: 3,
            elevation: 2,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: sectionTitleColor,
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            paddingBottom: 5,
        },
        projectTitle: {
            fontSize: 18,
            fontWeight: '600', // Semi-bold
            color: textColor,
            marginBottom: 8,
        },
        text: {
            fontSize: 15,
            color: textColor,
            lineHeight: 22,
            marginBottom: 10,
        },
        presentationDate: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 15,
            fontStyle: 'italic',
        },
        memberCard: {
            marginBottom: 15,
            paddingBottom: 10,
            borderBottomWidth: StyleSheet.hairlineWidth, // Linha fina separadora
            borderBottomColor: borderColor,
        },
        memberName: {
            fontSize: 17,
            fontWeight: 'bold',
            color: textColor,
        },
        memberRm: {
            fontSize: 14,
            color: isDark ? '#ccc' : '#555',
            marginBottom: 5,
        },
        linkButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
            alignSelf: 'flex-start', // Alinha o botão à esquerda
        },
        linkText: {
            fontSize: 15,
            color: linkColor,
            fontWeight: '500',
        },
        // Exporta cores para uso inline se necessário
        linkColor: linkColor,
    });
}