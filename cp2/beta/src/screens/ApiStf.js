// --- src/screens/ApiStf.js --- // Nome CORRETO do arquivo
// Busca Andamento Processual STF via CNJ DataJud (_search endpoint com APIKey)

import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert,
    ActivityIndicator, Keyboard, Share
} from 'react-native';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext'; // Verifique o caminho

// --- Constantes CNJ ---
const CNJ_API_BASE_URL = 'https://api-publica.datajud.cnj.jus.br';
// Chave pública oficial da Wiki do CNJ
const CNJ_API_KEY = "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
const ITEMS_PER_PAGE_PROCESSO = 10;
// Alias para STF - NÃO CONFIRMADO na documentação oficial encontrada. Pode não funcionar.
const STF_ALIAS = 'api_publica_stf';

// <<< Nome CORRETO da função exportada >>>
export default function ApiStf({ navigation }) {
    // --- States ---
    const [processInput, setProcessInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [ultimaPaginacaoProcesso, setUltimaPaginacaoProcesso] = useState(null);

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Funções Auxiliares ---
    const limparTela = useCallback(() => {
        setProcessInput('');
        setDados([]);
        setErro(null);
        setUltimaPaginacaoProcesso(null);
        Keyboard.dismiss();
    }, []);

    const formatarData = (dataStr) => {
        if (!dataStr) return "N/D";
        try {
            const date = new Date(dataStr);
            if (!isNaN(date.getTime())) {
                if (dataStr.includes('T') || dataStr.includes(' ')) { return date.toLocaleString('pt-BR', { timeZone: 'UTC' }); }
                return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }
            return dataStr;
        } catch { return dataStr; }
    };

    // --- Função de Busca STF via CNJ (_search) ---
    const buscarProcessoSTF = async (paginando = false) => {
        Keyboard.dismiss();
        const numeroCNJ = processInput.trim().replace(/[^0-9]/g, '');
        if (!numeroCNJ || numeroCNJ.length < 7) {
            Alert.alert("Erro", "Digite um número de processo CNJ válido (mínimo 7 dígitos).");
            return;
        }
        setCarregando(true);
        setErro(null);
        if (!paginando) {
            setDados([]);
            setUltimaPaginacaoProcesso(null);
        }

        try {
            const url = `${CNJ_API_BASE_URL}/${STF_ALIAS}/_search`;
            let query = {
                size: ITEMS_PER_PAGE_PROCESSO,
                query: { match: { numeroProcesso: numeroCNJ } },
                sort: [{ "@timestamp": { order: "asc" } }]
            };
            if (paginando && ultimaPaginacaoProcesso) { query.search_after = ultimaPaginacaoProcesso; } //

            console.log("Buscando Processo STF (CNJ _search) - URL:", url);
            console.log("Buscando Processo STF (CNJ _search) - Query:", JSON.stringify(query));

            const resposta = await axios.post(url, query, {
                headers: { 'Authorization': CNJ_API_KEY, 'Content-Type': 'application/json' }, //
                timeout: 30000
            });

            console.log("Resposta API CNJ-STF (_search):", resposta.status);

            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                setDados(prev => paginando ? [...prev, ...novosDados] : novosDados);
                const ultimo = novosDados[novosDados.length - 1];
                setUltimaPaginacaoProcesso(ultimo?.sort || null); //
            } else {
                if (!paginando) {
                    setDados([]);
                    setErro("Nenhuma informação encontrada para este processo no STF via DataJud.");
                    Alert.alert("Não encontrado", "Nenhuma informação para este processo no STF via DataJud.");
                } else { Alert.alert("Fim dos resultados", "Não há mais informações para carregar."); }
                setUltimaPaginacaoProcesso(null);
            }
        } catch (error) {
            if (!paginando) setDados([]);
            setUltimaPaginacaoProcesso(null);
            console.error("Erro ao buscar processo CNJ-STF (_search):", error.response?.data || error.message);
            let errorMsg = "Falha na busca de processo no STF via DataJud.";
            if (error.response) {
                errorMsg += `\nStatus: ${error.response.status}. ${JSON.stringify(error.response.data)}`;
                if (error.response.status === 404) {
                    errorMsg += `\n\nPossível causa: O alias '${STF_ALIAS}' pode não ser válido ou o serviço para STF não está disponível neste endpoint.`;
                    Alert.alert("Erro na Busca", `Não foi possível encontrar o serviço para STF (Erro 404). Verifique se o alias '${STF_ALIAS}' é válido ou se o serviço está disponível.`);
                } else { Alert.alert("Erro na Busca", errorMsg); }
            } else {
                errorMsg += `\n${error.message}`;
                Alert.alert("Erro na Busca", errorMsg);
            }
            setErro(errorMsg);
        } finally { setCarregando(false); }
    };

    // --- Função de Compartilhar ---
    const onShare = async () => {
        if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para compartilhar."); return; }
        try {
            let message = `Consulta Processo STF (CNJ DataJud):\nNúmero: ${processInput}\n`;
            dados.forEach((item, index) => {
                const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                const numeroProcesso = d.numeroProcesso || 'N/D';
                const tribunal = d.tribunal || 'STF (via CNJ)';
                const classeNome = d.classe?.nome || 'N/D'; //
                const dataAjuizamento = formatarData(d.dataAjuizamento); //
                const ultimoMovimento = d.movimentos?.[0]; //
                const ultimoMovTexto = ultimoMovimento ? `${formatarData(ultimoMovimento.dataHora)}: ${ultimoMovimento.nome || 'Movimento'}` : 'N/D'; //

                message += `\n--- Resultado ${index + 1} ---\n`;
                message += `Número: ${numeroProcesso}\nTribunal: ${tribunal}\n`;
                message += `Classe: ${classeNome}\n`;
                message += `Ajuizamento: ${dataAjuizamento}\n`;
                message += `Último Mov: ${ultimoMovTexto}\n`;
                message += `--------------------\n`;
            });
            message = message.substring(0, message.length - '--------------------\n'.length);
            await Share.share({ message });
        } catch (error) { Alert.alert("Erro", `Falha ao compartilhar: ${error.message}`); }
    };

    // --- Determina se pode carregar mais ---
    const podeCarregarMais = () => { return !carregando && !!ultimaPaginacaoProcesso; }; //

    // --- Renderização ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={ // Componentes do Cabeçalho (Input, Botões, Avisos)
                    <View>
                        <Text style={styles.titulo}>Busca Processo STF (via CNJ)</Text>
                        <Text style={styles.warningText}>Atenção: O acesso aos dados do STF por esta API pública não está explicitamente confirmado na documentação oficial encontrada.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Número CNJ do processo (só números)"
                            placeholderTextColor={styles.placeholderTextColor}
                            value={processInput}
                            onChangeText={(text) => setProcessInput(text.replace(/[^0-9]/g, ''))}
                            keyboardType={'numeric'}
                            maxLength={20}
                            onSubmitEditing={() => buscarProcessoSTF(false)}
                            returnKeyType="search"
                            editable={!carregando}
                        />
                        <View style={styles.buttonContainer}>
                            <Button title="Buscar Processo no STF" onPress={() => buscarProcessoSTF(false)} disabled={carregando || !processInput.trim() || processInput.trim().length < 7} color={styles.primaryColor} />
                        </View>
                        {(dados.length > 0 || carregando || erro) && (<View style={styles.buttonContainer}><Button title="Nova Busca / Limpar" onPress={limparTela} color={styles.secondaryButtonColor} disabled={carregando}/></View>)}
                        {carregando && (<ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} />)}
                        {erro && !carregando && !dados.length && (<Text style={styles.errorText}>Erro: {erro}</Text>)}
                    </View>
                }
                data={dados} // Array de resultados
                keyExtractor={(item, index) => item._id || index.toString()} // Chave única de cada item
                renderItem={({ item }) => { // Função para renderizar cada item da lista
                    const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                    // Adapte a extração e formatação conforme a estrutura de 'item._source'
                    const partesFormatadas = (d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []))?.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || '?'; const polo = pt.polo?.sigla || '?'; return `(${polo}) ${nome}`; }).join('\n') || 'N/I';
                    const movimentacoes = (d.movimentos || d.movimento)?.slice(0, 5).map((m, idx) => { const data = formatarData(m.dataHora); const nomeMovimento = m.nome || m.movimentoNacional?.descricao || 'Movimento'; return `📌 ${data}: ${nomeMovimento}`; }).join('\n') + ((d.movimentos?.length > 5) ? '\n...' : '') || 'N/I'; //
                    const nivelSigiloTexto = (dadosBasicos.nivelSigilo ?? d.nivelSigilo) === 0 ? 'Público' : `Sigiloso (${dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? '?'})`; //
                    const assuntosTexto = (d.assuntos || dadosBasicos.assuntos)?.map(a => a.nome || '?').join(' | ') || 'N/I'; //

                    return ( // Retorna a View para cada processo encontrado
                        <View style={styles.itemProcesso}>
                            <Text style={styles.tituloProcesso} selectable={true}>📄 Processo: <Text style={styles.valor}>{d.numeroProcesso || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}>🏛️ Tribunal: <Text style={styles.valor}>{d.tribunal || 'N/D'}</Text> | Grau: <Text style={styles.valor}>{d.grau || 'N/D'}</Text> | Sigilo: <Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>
                            <Text style={styles.linha} selectable={true}>🏷️ Classe: <Text style={styles.valor}>{d.classe?.nome || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}>📅 Ajuizamento: <Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>
                            <Text style={styles.linha} selectable={true}>📍 Órgão Julgador: <Text style={styles.valor}>{d.orgaoJulgador?.nome || 'N/D'}</Text></Text>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes (Resumo):</Text><Text style={styles.valor} selectable={true}>{partesFormatadas.substring(0, 200)}...</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Últimas 5):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
                        </View>
                    );
                }}
                ListFooterComponent={ // Componentes do Rodapé (Botões de paginação/share)
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {podeCarregarMais() && !carregando && (<View style={styles.buttonContainer}><Button title="Carregar mais resultados" onPress={() => buscarProcessoSTF(true)} disabled={carregando} color={styles.primaryColor} /></View>)}
                            {dados.length > 0 && !carregando && (<View style={styles.buttonContainer}><Button title="Compartilhar Resultados" onPress={onShare} color={styles.primaryColor} /></View>)}
                        </View>
                    ) : null
                }
                ListEmptyComponent={ // Mensagem se a lista estiver vazia
                    !carregando && !erro && processInput.trim().length >= 7 ? ( <View style={{alignItems: 'center', marginTop: 50}}><Text style={styles.textoInfo}>Nenhum resultado encontrado para este processo no STF via DataJud.</Text></View> ) : null
                }
            />
        </View>
    );
}

// --- Estilos ---
// Função getThemedStyles como na resposta anterior
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f8f9fa';
    const textColor = isDark ? '#e0e0e0' : '#212529';
    const borderColor = isDark ? '#444' : '#ced4da';
    const placeholderTextColor = isDark ? '#777' : '#6c757d';
    const primaryColor = isDark ? '#66bfff' : '#007bff';
    const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff';
    const itemBorderColor = primaryColor;
    const titleColor = isDark ? '#bbdffd' : '#003366';
    const valueColor = isDark ? '#cccccc' : '#343a40';
    const secondaryButtonColor = isDark ? '#ffb74d' : '#FFA500';
    const errorTextColor = isDark ? '#ff8a80' : '#dc3545';
    const warningTextColor = isDark ? '#ffe082' : '#ffc107';

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor },
        contentContainer: { padding: 15, paddingBottom: 40 },
        titulo: { fontSize: 20, marginBottom: 5, fontWeight: 'bold', color: textColor, textAlign: 'center' },
        warningText: { fontSize: 13, color: warningTextColor, textAlign: 'center', marginBottom: 15, fontStyle: 'italic' },
        input: { borderWidth: 1, borderColor: borderColor, backgroundColor: isDark ? '#2a2a2a' : '#fff', color: textColor, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5, marginBottom: 15, fontSize: 16 },
        itemProcesso: { padding: 15, marginVertical: 8, backgroundColor: itemBackgroundColor, borderLeftWidth: 5, borderLeftColor: itemBorderColor, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 2, elevation: 2 },
        tituloProcesso: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: titleColor },
        linha: { fontSize: 15, marginBottom: 3, color: textColor, lineHeight: 22 },
        valor: { color: valueColor, fontWeight: 'normal', fontSize: 15, lineHeight: 22 },
        activityIndicator: { marginVertical: 30 },
        buttonContainer: { marginVertical: 8 },
        footerButtons: { marginTop: 20, paddingBottom: 30 },
        textoInfo: { fontSize: 16, color: isDark ? '#aaa' : '#6c757d', textAlign: 'center' },
        errorText: { color: errorTextColor, textAlign: 'center', marginTop: 10, marginBottom: 10, fontSize: 15 },
        placeholderTextColor: placeholderTextColor,
        primaryColor: primaryColor,
        secondaryButtonColor: secondaryButtonColor,
    });
}