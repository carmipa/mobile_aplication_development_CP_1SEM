// --- src/screens/GroupInfoScreen.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    Linking,
    Image // <<< IMPORTADO para exibir imagens >>>
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';

// Componente da Tela de Informações do Grupo
export default function GroupInfoScreen({ navigation }) {
    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    const styles = getThemedStyles(isDarkMode);

    // Função para abrir links
    const handleLinkPress = (url) => {
        Linking.openURL(url).catch(err => {
            console.error("Não foi possível abrir o link", err);
            Alert.alert("Erro", "Não foi possível abrir o link.");
        });
    };

    // --- Dados do Grupo (COM CAMINHO DAS FOTOS) ---
    // <<< Adicionado a chave 'photo' com o require correto para cada membro >>>
    const groupMembers = [
        {
            name: 'Amanda Mesquita Cirino Da Silva',
            rm: 'RM559177',
            github: 'https://github.com/mandyy14',
            photo: require('../../assets/fotos/amanda.png') // <<< Caminho da foto
        },
        {
            name: 'Journey Tiago Lopes Ferreira',
            rm: 'RM556071',
            github: 'https://github.com/JouTiago',
            photo: require('../../assets/fotos/journey.png') // <<< Caminho da foto
        },
        {
            name: 'Paulo André Carminati',
            rm: 'RM557881',
            github: 'https://github.com/carmipa',
            photo: require('../../assets/fotos/paulo.png') // <<< Caminho da foto
        }
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
                        <TouchableOpacity style={styles.linkButton} onPress={() => handleLinkPress(projectRepoUrl)}>
                            <Feather name="github" size={18} color={styles.linkColor} style={{ marginRight: 5 }} />
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
                            // <<< memberCard agora usa flexDirection: 'row' >>>
                            <View key={index} style={styles.memberCard}>
                                {/* <<< Imagem do Membro >>> */}
                                <Image
                                    source={member.photo}
                                    style={styles.memberPhoto}
                                />
                                {/* <<< View para agrupar os detalhes do texto >>> */}
                                <View style={styles.memberDetails}>
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
    const sectionTitleColor = isDark ? '#bbdffd' : '#003366';
    const linkColor = isDark ? '#66bfff' : '#007bff';
    const borderColor = isDark ? '#333' : '#e0e0e0';
    const photoBorderColor = isDark ? '#555' : '#ccc'; // Borda sutil para a foto

    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        scrollViewContainer: {
            flexGrow: 1,
        },
        container: {
            flex: 1,
            padding: 25,
        },
        headerSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30,
            justifyContent: 'center',
        },
        mainTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: titleColor,
            textAlign: 'center',
            marginLeft: 10,
        },
        headerIconColor: titleColor,
        section: {
            marginBottom: 30,
            padding: 20,
            backgroundColor: cardBackgroundColor,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: borderColor,
            shadowColor: "#000",
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
            fontWeight: '600',
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
        // Estilos para o Card de Membro
        memberCard: {
            flexDirection: 'row', // <<< Para alinhar foto e texto lado a lado
            alignItems: 'center', // <<< Alinha verticalmente foto e texto
            marginBottom: 20, // Aumenta espaço entre membros
            paddingBottom: 15, // Aumenta espaço antes da borda
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: borderColor,
        },
        // <<< Estilo para a Foto >>>
        memberPhoto: {
            width: 60, // Tamanho da foto
            height: 60, // Tamanho da foto
            borderRadius: 30, // Metade da largura/altura para círculo perfeito
            marginRight: 15, // Espaço entre a foto e os detalhes
            borderWidth: 1, // Borda sutil (opcional)
            borderColor: photoBorderColor, // Cor da borda sutil
        },
        // <<< Container para os detalhes em texto >>>
        memberDetails: {
            flex: 1, // Ocupa o espaço restante ao lado da foto
            justifyContent: 'center', // Centraliza o conteúdo verticalmente (se a foto for maior)
        },
        memberName: {
            fontSize: 17,
            fontWeight: 'bold',
            color: textColor,
            marginBottom: 2, // Menos espaço abaixo do nome
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
            alignSelf: 'flex-start',
        },
        linkText: {
            fontSize: 15,
            color: linkColor,
            fontWeight: '500',
        },
        linkColor: linkColor,
    });
}