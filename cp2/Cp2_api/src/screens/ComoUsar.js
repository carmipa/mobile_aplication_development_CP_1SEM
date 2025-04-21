// --- src/screens/ComoUsar.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    SafeAreaView
    // TouchableOpacity e Linking não são usados aqui, podem ser removidos se não forem necessários em outro lugar desta tela
} from 'react-native';
import { Feather } from '@expo/vector-icons'; // Ícones
import { useThemeContext } from '../context/ThemeContext'; // Tema

export default function ComoUsar() {
    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    const styles = getThemedStyles(isDarkMode); // Estilos dinâmicos

    // Helper para renderizar texto com ícone inline
    const renderTextWithIcon = (iconName, text) => (
        <Text style={styles.stepInstruction}>
            <Feather name={iconName} size={styles.inlineIcon.fontSize} color={styles.iconColor} style={styles.inlineIcon} />
            {' '}{text}
        </Text>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>

                    {/* Título da Tela */}
                    <View style={styles.headerSection}>
                        <Feather name="help-circle" size={30} color={styles.titleColor} />
                        <Text style={styles.mainTitle}>Como Usar o App</Text>
                    </View>

                    {/* Instruções Passo a Passo */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Realizando uma Busca por Número de Processo</Text>

                        {/* Passo 1 */}
                        <View style={styles.step}>
                            <Feather name="list" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Passo 1:</Text>
                                <Text style={styles.stepInstruction}>
                                    Selecione o <Text style={styles.highlight}>Tipo de Justiça</Text> desejado (Estadual, Federal, etc.) na primeira caixa de seleção.
                                </Text>
                            </View>
                        </View>

                        {/* Passo 2 */}
                        <View style={styles.step}>
                            <Feather name="list" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Passo 2:</Text>
                                <Text style={styles.stepInstruction}>
                                    Após selecionar o tipo, a segunda caixa de seleção será habilitada. Escolha o <Text style={styles.highlight}>Tribunal</Text> específico onde o processo tramita.
                                </Text>
                            </View>
                        </View>

                        {/* Passo 3 */}
                        <View style={styles.step}>
                            <Feather name="edit-3" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Passo 3:</Text>
                                <Text style={styles.stepInstruction}>
                                    Digite os <Text style={styles.highlight}>20 dígitos</Text> do número unificado do processo no campo de texto, <Text style={styles.highlight}>apenas números</Text>, sem pontos, traços ou barras.
                                </Text>
                            </View>
                        </View>

                        {/* Passo 4 */}
                        <View style={styles.step}>
                            <Feather name="search" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Passo 4:</Text>
                                <Text style={styles.stepInstruction}>
                                    Clique no botão <Text style={styles.highlight}>"Buscar"</Text>.
                                </Text>
                            </View>
                        </View>

                        {/* Passo 5 - COM ÍCONES INLINE */}
                        <View style={styles.step}>
                            <Feather name="arrow-down-circle" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Passo 5 (Resultados):</Text>
                                <Text style={styles.stepInstruction}>
                                    Aguarde os resultados. Você verá informações como:
                                </Text>
                                {/* Usando helper para ícones inline */}
                                {renderTextWithIcon("file-text", "Número do Processo")}
                                {renderTextWithIcon("briefcase", "Tribunal, Grau e Sigilo")}
                                {renderTextWithIcon("tag", "Classe Processual")}
                                {renderTextWithIcon("map-pin", "Órgão Julgador")}
                                {renderTextWithIcon("calendar", "Data de Ajuizamento")}
                                {renderTextWithIcon("dollar-sign", "Valor da Causa")}
                                {renderTextWithIcon("book-open", "Assunto(s)")}
                                {renderTextWithIcon("users", "Partes e Advogados")}
                                {renderTextWithIcon("activity", "Últimas Movimentações")}
                                <Text style={[styles.stepInstruction, {marginTop: 10}]}>
                                    Use os botões <Text style={styles.highlight}>"Carregar mais"</Text> (se disponível) e <Text style={styles.highlight}>"Compartilhar"</Text> no final da lista.
                                </Text>
                            </View>
                        </View>

                        {/* Dica Adicional */}
                        <View style={[styles.step, styles.tip]}>
                            <Feather name="alert-circle" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                            <View style={styles.stepTextContainer}>
                                <Text style={styles.stepNumber}>Dica:</Text>
                                <Text style={styles.stepInstruction}>
                                    A busca por nome da parte/advogado não é suportada pela API pública atual do CNJ. Utilize a busca por número.
                                </Text>
                            </View>
                        </View>

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
    const textColor = isDark ? '#e0e0e0' : '#333344';
    const titleColor = isDark ? '#ffffff' : '#1a1a2e';
    const sectionTitleColor = isDark ? '#bbdffd' : '#003366';
    const iconColor = isDark ? '#66bfff' : '#007bff';
    const highlightColor = isDark ? '#77ccff' : '#0056b3';
    const borderColor = isDark ? '#333' : '#e0e0e0';

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
            padding: 20,
        },
        headerSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 25,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
        },
        mainTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: titleColor,
            marginLeft: 10,
        },
        section: {
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: sectionTitleColor,
            marginBottom: 20,
        },
        step: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 25,
        },
        stepIcon: {
            marginRight: 15,
            marginTop: 2,
        },
        stepTextContainer: {
            flex: 1,
        },
        stepNumber: {
            fontSize: 16,
            fontWeight: 'bold',
            color: titleColor,
            marginBottom: 4,
        },
        stepInstruction: {
            fontSize: 15,
            color: textColor,
            lineHeight: 23,
            marginBottom: 5, // Espaço entre itens da lista no passo 5
        },
        highlight: {
            fontWeight: 'bold',
            color: highlightColor,
        },
        tip: {
            marginTop: 30,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: borderColor,
        },
        // <<< Estilo para ícones DENTRO do texto >>>
        inlineIcon: {
            fontSize: 15, // Tamanho similar ao texto
            marginRight: 4, // Pequeno espaço após o ícone
        },
        // Exporta cores
        titleColor: titleColor,
        iconColor: iconColor,
    });
}