// --- src/screens/InfoScreen.js ---
import React from 'react';
import { View, Text, StyleSheet, Linking, Button } from 'react-native';
// <<< Importa o novo conjunto de ícones >>>
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext'; // Verifique o caminho

export default function InfoScreen() {
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';

    // Estilos dinâmicos
    const styles = getThemedStyles(isDarkMode);

    const handleLinkPress = (url) => {
        Linking.openURL(url).catch(err => console.error("Não foi possível abrir o link", err));
    };

    return (
        <View style={styles.container}>
            {/* <<< Ícone Adicionado >>> */}
            <MaterialCommunityIcons
                name="account-hard-hat" // Ícone de capacete/construção
                size={64}
                color={styles.iconColor} // Cor baseada no tema
                style={{ marginBottom: 20 }} // Espaçamento abaixo do ícone
            />

            <Text style={styles.title}>Busca por Nome Indisponível</Text>

            <Text style={styles.text}>
                Atualmente, a API Pública do DataJud (fornecida pelo CNJ)
                está em fase Beta e **não oferece suporte oficial direto
                para realizar buscas de processos pelo nome da parte ou advogado**.
            </Text>
            <Text style={styles.text}>
                A API foi projetada principalmente para consultas por número
                unificado do processo, classe processual ou órgão julgador,
                respeitando as diretrizes da Lei Geral de Proteção de Dados (LGPD).
            </Text>
            <Text style={styles.text}>
                Para realizar buscas por nome, recomendamos utilizar os
                portais de consulta pública dos respectivos tribunais ou
                o portal do próprio CNJ.
            </Text>
            {/* <<< Texto de Desculpas Adicionado >>> */}
            <Text style={[styles.text, styles.apologyText]}>
                Pedimos desculpas pelo inconveniente.
            </Text>

            {/* Botões Mantidos */}
            <View style={styles.buttonContainer}>
                <Button
                    title="Consultar Orientações DataJud CNJ"
                    onPress={() => handleLinkPress('https://datajud-wiki.cnj.jus.br/')}
                    color={styles.buttonColor}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Consulta Pública CNJ"
                    onPress={() => handleLinkPress('https://www.cnj.jus.br/pjecnj/ConsultaPublica/listView.seam')} // Exemplo, verifique link atual
                    color={styles.buttonColor}
                />
            </View>
        </View>
    );
}

// Função de estilos atualizada para incluir cor do ícone e texto de desculpas
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#1c1c1c' : '#f0f0f0';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    const titleColor = isDark ? '#ffffff' : '#000000';
    const buttonColor = isDark ? '#66bfff' : '#007bff';
    const iconColor = isDark ? '#FFA500' : '#f0ad4e'; // Laranja/Amarelo para destaque do ícone
    const apologyTextColor = isDark ? '#bbbbbb' : '#555555'; // Cor um pouco diferente para desculpas

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 25,
            backgroundColor: backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: titleColor,
            textAlign: 'center',
            marginBottom: 20,
        },
        text: {
            fontSize: 16,
            color: textColor,
            textAlign: 'justify',
            marginBottom: 15,
            lineHeight: 24,
        },
        apologyText: { // Estilo específico para o texto de desculpas
            color: apologyTextColor,
            fontStyle: 'italic', // Opcional: Itálico
            textAlign: 'center', // Centraliza as desculpas
            marginTop: 10, // Espaço acima das desculpas
        },
        buttonContainer: {
            marginTop: 15,
            width: '80%',
        },
        // Exporta cores para props
        buttonColor: buttonColor,
        iconColor: iconColor, // Exporta cor do ícone
    });
}