// --- src/screens/ComoUsar.js ---
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    SafeAreaView
} from 'react-native';
// <<< Importa todos os tipos de ícones necessários >>>
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';

export default function ComoUsar() {
    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDarkMode = currentTheme === 'dark';
    const styles = getThemedStyles(isDarkMode);

    // (O helper renderTextWithIcon foi removido pois os ícones agora estão nos blocos de features)

    // Componente auxiliar para blocos de funcionalidade (reutiliza estilo 'step')
    const FeatureBlock = ({ iconName, iconFamily = 'Feather', title, children }) => {
        const IconComponent = iconFamily === 'Ionicons' ? Ionicons :
            iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
                Feather;
        return (
            <View style={styles.step}>
                <IconComponent name={iconName} size={24} color={styles.iconColor} style={styles.stepIcon}/>
                <View style={styles.stepTextContainer}>
                    <Text style={styles.stepNumber}>{title}</Text>
                    {children}
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>

                    {/* Título da Tela */}
                    <View style={styles.headerSection}>
                        <Feather name="help-circle" size={30} color={styles.titleColor} />
                        <Text style={styles.mainTitle}>Como Usar o App</Text>
                    </View>

                    {/* Seção: Realizando a Busca */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Realizando uma Busca por Número</Text>

                        {/* Passo 1 a 4 (iguais) */}
                        <FeatureBlock iconName="list" title="Passo 1: Tipo de Justiça">
                            <Text style={styles.stepInstruction}>
                                Selecione o <Text style={styles.highlight}>Tipo de Justiça</Text> desejado (Estadual, Federal, etc.) na primeira caixa de seleção.
                            </Text>
                        </FeatureBlock>
                        <FeatureBlock iconName="list" title="Passo 2: Tribunal">
                            <Text style={styles.stepInstruction}>
                                Após selecionar o tipo, escolha o <Text style={styles.highlight}>Tribunal</Text> específico na segunda caixa de seleção.
                            </Text>
                        </FeatureBlock>
                        <FeatureBlock iconName="edit-3" title="Passo 3: Número do Processo">
                            <Text style={styles.stepInstruction}>
                                Digite os <Text style={styles.highlight}>20 dígitos</Text> do número unificado no campo apropriado, <Text style={styles.highlight}>apenas números</Text>.
                            </Text>
                        </FeatureBlock>
                        <FeatureBlock iconName="search" title="Passo 4: Buscar">
                            <Text style={styles.stepInstruction}>
                                Clique no botão <Text style={styles.highlight}>"Buscar"</Text>.
                            </Text>
                        </FeatureBlock>

                        {/* Passo 5 (Resultados - simplificado) */}
                        <FeatureBlock iconName="file-text" title="Passo 5: Resultados">
                            <Text style={styles.stepInstruction}>
                                Aguarde os resultados serem exibidos. Você verá detalhes do processo, partes, movimentações, etc.
                            </Text>
                        </FeatureBlock>
                    </View>

                    {/* <<< NOVA SEÇÃO: Funcionalidades Adicionais >>> */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Funcionalidades Adicionais da Busca</Text>

                        <FeatureBlock iconFamily="Ionicons" iconName="close-circle-outline" title="Limpar Campo de Busca">
                            <Text style={styles.stepInstruction}>
                                Toque no ícone <Ionicons name="close-circle-outline" size={styles.inlineIconSize} color={styles.iconColor}/> ao lado direito do campo de número para apagar o texto rapidamente.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="MaterialCommunityIcons" iconName="history" title="Histórico de Buscas (Últimas 10)">
                            <Text style={styles.stepInstruction}>
                                Use o seletor <Text style={styles.highlight}>"Últimas 10 Buscas"</Text> para recarregar os dados de uma busca anterior (número e tribunal).
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="Ionicons" iconName="star-outline" title="Favoritar Processo">
                            <Text style={styles.stepInstruction}>
                                Em cada resultado, toque na estrela <Ionicons name="star-outline" size={styles.inlineIconSize} color={styles.iconColor}/> / <Ionicons name="star" size={styles.inlineIconSize} color={styles.highlight}/> no canto superior direito para adicionar ou remover o processo dos seus favoritos.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="Ionicons" iconName="share-social-outline" title="Compartilhar Resultado (Texto)">
                            <Text style={styles.stepInstruction}>
                                No final da lista de resultados, toque no botão <Text style={styles.highlight}>"Resultado"</Text> (<Ionicons name="share-social-outline" size={styles.inlineIconSize} color={styles.highlight}/>) para compartilhar os detalhes como texto.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="MaterialCommunityIcons" iconName="file-pdf-box" title="Gerar Relatório (PDF)">
                            <Text style={styles.stepInstruction}>
                                Use o botão <Text style={styles.highlight}>"Gerar PDF"</Text> (<MaterialCommunityIcons name="file-pdf-box" size={styles.inlineIconSize} color={styles.highlight}/>) no final dos resultados para criar um arquivo PDF da consulta.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="Ionicons" iconName="refresh-outline" title="Nova Pesquisa">
                            <Text style={styles.stepInstruction}>
                                Após uma busca, o botão <Text style={styles.highlight}>"Nova Pesquisa"</Text> (<Ionicons name="refresh-outline" size={styles.inlineIconSize} color={styles.highlight}/>) permite limpar toda a tela para iniciar uma nova consulta.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="MaterialCommunityIcons" iconName="arrow-down-circle-outline" title="Carregar Mais">
                            <Text style={styles.stepInstruction}>
                                Se houver mais dados disponíveis para o processo (além dos 10 iniciais), o botão <Text style={styles.highlight}>"Carregar mais"</Text> aparecerá no final para buscar informações adicionais.
                            </Text>
                        </FeatureBlock>

                    </View>

                    {/* <<< NOVA SEÇÃO: Gerenciando Favoritos >>> */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Gerenciando Seus Favoritos</Text>

                        <FeatureBlock iconFamily="Ionicons" iconName="star" title="Acessar a Lista">
                            <Text style={styles.stepInstruction}>
                                Acesse a tela <Text style={styles.highlight}>"Processos Favoritos"</Text> através do menu lateral (gaveta) ou pela aba inferior correspondente.
                            </Text>
                        </FeatureBlock>

                        <FeatureBlock iconFamily="Feather" iconName="tool" title="Ações na Lista">
                            <Text style={styles.stepInstruction}>
                                Dentro da lista de favoritos, você pode:
                            </Text>
                            <Text style={styles.subStepInstruction}>
                                <Text style={styles.highlight}>• Remover:</Text> Clique na lixeira (<Ionicons name="trash-outline" size={styles.inlineIconSize} color={styles.iconColor}/>) para remover um processo dos favoritos.
                            </Text>
                            <Text style={styles.subStepInstruction}>
                                <Text style={styles.highlight}>• Buscar Novamente:</Text> Clique na lupa (<MaterialCommunityIcons name="magnify" size={styles.inlineIconSize} color={styles.iconColor}/>) para ir à tela de busca com os dados daquele processo preenchidos.
                            </Text>
                        </FeatureBlock>
                    </View>


                    {/* Dica sobre busca por nome (mantida) */}
                    <View style={[styles.step, styles.tip]}>
                        <Feather name="alert-circle" size={24} color={styles.iconColor} style={styles.stepIcon}/>
                        <View style={styles.stepTextContainer}>
                            <Text style={styles.stepNumber}>Importante:</Text>
                            <Text style={styles.stepInstruction}>
                                A busca por nome da parte/advogado não é suportada pela API pública atual do CNJ. Utilize a busca por número unificado.
                            </Text>
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
    // const cardBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; // Não usado diretamente aqui
    const textColor = isDark ? '#e0e0e0' : '#333344';
    const titleColor = isDark ? '#ffffff' : '#1a1a2e';
    const sectionTitleColor = isDark ? '#bbdffd' : '#003366';
    const iconColor = isDark ? '#66bfff' : '#007bff';
    const highlightColor = isDark ? '#77ccff' : '#0056b3';
    const borderColor = isDark ? '#333' : '#e0e0e0';
    const inlineIconSize = 16; // Tamanho padrão para ícones inline

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
            marginBottom: 25, // Espaço entre seções
            paddingBottom: 15, // Espaço antes da borda (se houver)
            borderBottomWidth: 1, // Linha separadora entre seções
            borderBottomColor: borderColor,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: sectionTitleColor,
            marginBottom: 20,
        },
        step: { // Reutilizado como 'FeatureBlock'
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 20, // Espaço entre blocos/passos
        },
        stepIcon: {
            marginRight: 15,
            marginTop: 3, // Ajuste fino
        },
        stepTextContainer: {
            flex: 1,
        },
        stepNumber: { // Usado como título do bloco/feature
            fontSize: 16,
            fontWeight: 'bold',
            color: titleColor,
            marginBottom: 6, // Espaço após o título do bloco
        },
        stepInstruction: {
            fontSize: 15,
            color: textColor,
            lineHeight: 23,
            marginBottom: 5,
        },
        subStepInstruction: { // Para itens dentro de um bloco (ex: ações na lista de favoritos)
            fontSize: 15,
            color: textColor,
            lineHeight: 23,
            marginBottom: 8,
            marginLeft: 10, // Pequeno recuo
        },
        highlight: {
            fontWeight: 'bold',
            color: highlightColor,
        },
        tip: {
            marginTop: 20,
            borderTopWidth: 1, // Linha acima da dica final
            borderTopColor: borderColor,
            borderBottomWidth: 0, // Remove borda inferior da dica
            paddingTop: 20, // Espaço acima do texto da dica
            marginBottom: 0, // Remove espaço extra abaixo da dica
        },
        // Estilo para ícones DENTRO do texto
        inlineIconSize: inlineIconSize, // Exporta para uso inline
        // Exporta cores (não estritamente necessário aqui, mas pode ser útil)
        titleColor: titleColor,
        iconColor: iconColor,
    });
}