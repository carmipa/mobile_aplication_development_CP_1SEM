// --- src/screens/Api.js ---
import React, { useState, useMemo, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, FlatList, Alert,
    ActivityIndicator, Keyboard, Share,
    Pressable
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';
import { tiposJustica, tribunais } from '../data/tribunaisData.js';
import { generateAndSharePdfReport } from '../utils/pdfService';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native'; // Import useRoute

export default function Api({ navigation }) {
    // --- States --- (Todos os estados necessários) ---
    const [input, setInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [historicoSelecionadoId, setHistoricoSelecionadoId] = useState("");
    // --- Estado de Favoritos ---
    const [favoritos, setFavoritos] = useState([]);

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);
    const route = useRoute(); // Obter a rota

    // --- Carregar Histórico e Favoritos ---
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            // Carregar Histórico
            try {
                const historicoSalvo = await AsyncStorage.getItem('@searchHistory');
                if (historicoSalvo !== null) {
                    setHistorico(JSON.parse(historicoSalvo));
                }
            } catch (e) {
                console.error('Erro ao carregar histórico:', e);
                // Alert.alert("Erro", "Não foi possível carregar o histórico."); // Pode comentar se for muito alerta
            }
            // Carregar Favoritos
            try {
                const favoritosSalvos = await AsyncStorage.getItem('@favoriteProcesses');
                if (favoritosSalvos !== null) {
                    setFavoritos(JSON.parse(favoritosSalvos));
                }
            } catch (e) {
                console.error('Erro ao carregar favoritos:', e);
                // Alert.alert("Erro", "Não foi possível carregar os favoritos."); // Pode comentar
            }
        };
        carregarDadosIniciais();
    }, []); // Executa apenas na montagem inicial

    // --- Efeito para pré-preencher busca vinda dos Favoritos ---
    useEffect(() => {
        // Verifica se os parâmetros existem e se realmente vieram (evita loop se já foram limpos)
        if (route.params?.processo && route.params?.tribunal) {
            const { processo, tribunal } = route.params;
            console.log("Recebido dos Favoritos para preencher busca:", { processo, tribunal });

            const tribunalInfo = tribunais.find(t => t.url === tribunal);
            const tipoJustica = tribunalInfo ? tribunalInfo.tipo : '';

            // Define os estados para realizar a busca
            setInput(processo);
            setTipoJusticaSelecionado(tipoJustica);
            const filtrados = tribunais.filter(t => t.tipo === tipoJustica || t.url === '');
            setTribunaisFiltrados(filtrados);
            setTribunalSelecionado(tribunal);

            // Limpa resultados anteriores e seleções
            setDados([]);
            setUltimaPaginacao(null);
            setHistoricoSelecionadoId(""); // Limpa seleção do histórico também
            Keyboard.dismiss();

            // Remove os parâmetros da rota para não re-executar ao voltar
            // É importante fazer isso *antes* de qualquer navegação ou ação assíncrona
            navigation.setParams({ processo: undefined, tribunal: undefined });

            // Alerta para o usuário confirmar a busca
            Alert.alert("Dados Carregados", `Processo ${processo} carregado dos favoritos. Selecione o tribunal e pressione 'Buscar'.`, [{ text: "OK" }]);
            // Não busca automaticamente, espera o usuário confirmar.
        }
    }, [route.params?.processo, route.params?.tribunal]); // Dependências específicas


    // --- Funções Auxiliares ---
    const limparTela = () => { setInput(''); setDados([]); setTribunalSelecionado(''); setTipoJusticaSelecionado(''); setTribunaisFiltrados([]); setUltimaPaginacao(null); Keyboard.dismiss(); setHistoricoSelecionadoId(""); /* Favoritos persistem */};
    const formatarData = (dataStr) => { if (!dataStr) return "Não informada"; try { const date = new Date(dataStr); return isNaN(date.getTime()) ? dataStr : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } catch { return dataStr; } };
    const limparInput = () => { setInput(''); };

    // --- Salvar Histórico (limite 10) ---
    const salvarNoHistorico = async (numero, tribunalUrl) => { try { const tribunalInfo = tribunais.find(t => t.url === tribunalUrl); const nomeTribunal = tribunalInfo ? tribunalInfo.nome : tribunalUrl; const novaBusca = { id: `${numero}-${tribunalUrl}-${Date.now()}`, numero: numero, tribunalUrl: tribunalUrl, tribunalNome: nomeTribunal, timestamp: Date.now() }; let historicoAtual = [...historico]; if (historicoAtual.length > 0 && historicoAtual[0].numero === novaBusca.numero && historicoAtual[0].tribunalUrl === novaBusca.tribunalUrl) { return; } historicoAtual = historicoAtual.filter(item => !(item.numero === novaBusca.numero && item.tribunalUrl === novaBusca.tribunalUrl)); const novoHistorico = [novaBusca, ...historicoAtual].slice(0, 10); await AsyncStorage.setItem('@searchHistory', JSON.stringify(novoHistorico)); setHistorico(novoHistorico); } catch (e) { console.error('Erro ao salvar histórico:', e); } };


    // --- Funções de Favoritos ---
    const toggleFavorito = async (item) => {
        // Extrai dados do item do resultado da busca
        const numeroProcesso = item._source?.numeroProcesso;
        const tribunalNomeApi = item._source?.tribunal; // Nome textual (ou sigla) vindo da API

        // Tenta encontrar a URL correspondente no seu array `tribunais` local
        // Ajuste essa lógica se necessário, dependendo do que a API retorna em `d.tribunal`
        const tribunalInfo = tribunais.find(t =>
            t.nome.toUpperCase().includes(tribunalNomeApi?.toUpperCase() || '') || // Verifica se nome inclui
            t.sigla?.toUpperCase() === tribunalNomeApi?.toUpperCase() // Verifica sigla exata
        );
        // Usa a URL encontrada ou, como fallback, a URL que estava selecionada no Picker no momento da busca
        const tribunalUrl = tribunalInfo ? tribunalInfo.url : tribunalSelecionado;

        if (!numeroProcesso || !tribunalUrl) {
            Alert.alert("Erro", "Dados insuficientes para favoritar/desfavoritar o processo (Número ou Tribunal não identificados).");
            console.error("Erro ao favoritar - Dados faltando:", { numeroProcesso, tribunalUrl, tribunalNomeApi, tribunalInfo, tribunalSelecionado });
            return;
        }

        // Cria um ID único para o favorito baseado no número e na URL do tribunal
        const favoritoId = `${numeroProcesso}-${tribunalUrl}`;
        // Define o nome do tribunal que será salvo no favorito (pega do seu array local se encontrou, senão usa o da API ou a URL)
        const nomeTribunalDisplay = tribunalInfo ? tribunalInfo.nome : (tribunalNomeApi || tribunalUrl);

        let novosFavoritos = [...favoritos]; // Copia o array atual de favoritos
        const index = novosFavoritos.findIndex(fav => fav.id === favoritoId); // Procura se já existe
        let mensagemAlerta = "";

        if (index > -1) { // Se achou (index > -1), remove o item
            novosFavoritos.splice(index, 1);
            mensagemAlerta = "Processo removido dos favoritos.";
        } else { // Se não achou, adiciona o novo favorito
            novosFavoritos.push({
                id: favoritoId,
                numero: numeroProcesso,
                tribunalUrl: tribunalUrl,       // URL para busca futura
                tribunalNome: nomeTribunalDisplay, // Nome para exibição na lista
                timestamp: Date.now()           // Data de adição
            });
            // Opcional: Limitar quantidade de favoritos
            // novosFavoritos = novosFavoritos.slice(-50); // Ex: Mantém os 50 mais recentes
            mensagemAlerta = "Processo adicionado aos favoritos!";
        }

        try {
            // Salva a lista atualizada no AsyncStorage
            await AsyncStorage.setItem('@favoriteProcesses', JSON.stringify(novosFavoritos));
            // Atualiza o estado local para refletir a mudança na interface
            setFavoritos(novosFavoritos);
            Alert.alert("Favoritos", mensagemAlerta); // Feedback para o usuário
        } catch (e) {
            console.error('Erro ao salvar/atualizar favoritos:', e);
            Alert.alert("Erro", "Não foi possível atualizar a lista de favoritos.");
        }
    };

    // --- Função Principal de Busca ---
    const buscarDados = async (paginando = false) => { Keyboard.dismiss(); if (!input.trim()) { Alert.alert("Erro", "Digite o número do processo."); return; } if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; } if (!paginando) { /* Salva no histórico apenas na busca inicial */ await salvarNoHistorico(input.trim(), tribunalSelecionado); } setCarregando(true); if (!paginando) { /* Reseta dados apenas na busca inicial */ setDados([]); setUltimaPaginacao(null); } try { const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`; const apiKey = "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=="; let query = { size: 10, query: { match: { numeroProcesso: input.trim() } }, sort: [{ "@timestamp": { order: "asc" } }] }; if (paginando && ultimaPaginacao) { query.search_after = ultimaPaginacao; } const resposta = await axios.post(url, query, { headers: { Authorization: apiKey, 'Content-Type': 'application/json' }, timeout: 30000 }); if (resposta.data?.hits?.hits?.length > 0) { const novosDados = resposta.data.hits.hits; setDados(prev => paginando ? [...prev, ...novosDados] : [...novosDados]); const ultimo = novosDados[novosDados.length - 1]; setUltimaPaginacao(ultimo?.sort || null); } else { if (!paginando) { setDados([]); Alert.alert("Nada encontrado", "Nenhuma informação para este processo neste tribunal."); } else { Alert.alert("Fim dos resultados", "Não há mais informações para carregar."); } setUltimaPaginacao(null); } } catch (erro) { setDados([]); setUltimaPaginacao(null); let errorMsg = "Falha na busca."; if (erro.response) { console.error("Erro API:", erro.response.status, erro.response.data); errorMsg += `\nStatus: ${erro.response.status}.`; } else if (erro.request) { console.error("Erro Req:", erro.request); errorMsg += "\nSem resposta do servidor/timeout."; } else { console.error("Erro:", erro.message); errorMsg += `\n${erro.message}`; } Alert.alert("Erro", errorMsg); console.error("Objeto erro completo:", erro); } finally { setCarregando(false); } };

    // --- Função de Compartilhar Texto Simples ---
    const onShareTexto = async () => { if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para compartilhar."); return; } try { let message = `Consulta Processual (Número: ${input}):\n`; dados.forEach((item, index) => { const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {}; const numeroProcesso = d.numeroProcesso || 'N/D'; const tribunal = d.tribunal || 'N/D'; const grau = d.grau || 'N/D'; const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'N/I'; const classeCodigo = d.classe?.codigo; const classeNome = d.classe?.nome || 'N/D'; const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D'; const orgaoCodigo = d.orgaoJulgador?.codigo; const dataAjuizamento = formatarData(d.dataAjuizamento); const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I'; const custas = dadosBasicos.custasRecolhidas; const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || ''); const juizo100 = dadosBasicos.juizo100Digital; const assuntosTexto = (Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'N/I')); const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []); const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || ''; const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || ''; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ') : ''; return `(${polo || 'N/I'}) ${nome} ${tipoPessoa ? `[${tipoPessoa}]` : ''}${documento ? ` (Doc: ${documento})` : ''}${advogadosFormatados}`; }).join('\n\n') : 'Partes não informadas'; const movimentosArray = d.movimentos || d.movimento; const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = `\n     -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? `\n     -> ${complementoTexto}` : ''; return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Sem movimentações registradas.'; message += `\n--- Processo ${index + 1} ---\n`; message += `Número: ${numeroProcesso}\n`; message += `Tribunal: ${tribunal} | Grau: ${grau} | Sigilo: ${nivelSigiloTexto}\n`; message += `Classe: ${classeCodigo ? `(${classeCodigo}) ` : ''}${classeNome}\n`; message += `Órgão Julgador: ${orgaoTexto} ${orgaoCodigo ? `(${orgaoCodigo})` : ''}\n`; message += `Ajuizamento: ${dataAjuizamento}\n`; message += `Valor Causa: ${valorCausaTexto}\n`; if (custas !== undefined && custas !== null) message += `Custas Recolhidas: ${custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`; if (prioridades) message += `Prioridade(s): ${prioridades}\n`; if (juizo100 === true || juizo100 === false) message += `Juízo 100% Digital: ${juizo100 ? 'Sim' : 'Não'}\n`; message += `\nAssunto(s):\n${assuntosTexto}\n`; message += `\nPartes:\n${partesFormatadas}\n`; message += `\nMovimentações (Últimas 15):\n${movimentacoes}\n`; message += `--------------------\n`; }); if(message.endsWith('--------------------\n')) { message = message.substring(0, message.length - '--------------------\n'.length); } if (dados.some(item => (item._source?.movimentos || item._source?.movimento)?.length > 15)) { message += "\n(Lista de movimentos limitada aos 15 mais recentes por processo)"; } await Share.share({ message, title: `Consulta Processo ${input}` }); } catch (error) { Alert.alert("Erro ao Compartilhar", `Falha ao preparar/enviar dados: ${error.message}`); console.error("Erro ao compartilhar texto:", error); } };

    // --- Função para chamar o Serviço de PDF ---
    const handleGeneratePdf = async () => { if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para gerar o PDF."); return; } setCarregando(true); try { await generateAndSharePdfReport(dados, input, isDark); } catch (error) { console.error("Erro retornado ao chamar generateAndSharePdfReport:", error); Alert.alert("Erro PDF", "Falha ao gerar ou compartilhar o PDF."); } finally { setCarregando(false); } };


    // --- Handler para seleção no Picker de Histórico ---
    const handleHistoricoSelect = (selectedItemId) => { setHistoricoSelecionadoId(selectedItemId); if (selectedItemId && selectedItemId !== "") { const itemSelecionado = historico.find(item => item.id === selectedItemId); if (itemSelecionado) { const { numero, tribunalUrl } = itemSelecionado; const tribunalInfo = tribunais.find(t => t.url === tribunalUrl); const tipoJustica = tribunalInfo ? tribunalInfo.tipo : ''; setInput(numero); setTipoJusticaSelecionado(tipoJustica); const filtrados = tribunais.filter(t => t.tipo === tipoJustica || t.url === ''); setTribunaisFiltrados(filtrados); setTribunalSelecionado(tribunalUrl); Keyboard.dismiss(); setDados([]); setUltimaPaginacao(null); } } };

    // --- Renderização ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        {/* Seu Cabeçalho ... */}
                        <Text style={styles.titulo}>Busca por Número de Processo</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={tipoJusticaSelecionado} onValueChange={(itemValue) => { setTipoJusticaSelecionado(itemValue); const filtrados = tribunais.filter(t => t.tipo === itemValue || t.url === ''); setTribunaisFiltrados(filtrados); setTribunalSelecionado(''); setDados([]); setUltimaPaginacao(null); }} style={styles.picker} dropdownIconColor={styles.pickerDropdownColor}>
                                <Picker.Item label="1. Selecione o Tipo de Justiça" value="" style={styles.pickerItemStyle} />{tiposJustica.map((tipo) => (<Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} style={tipoJusticaSelecionado !== '' && tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                            </Picker>
                        </View>
                        {tipoJusticaSelecionado !== '' && ( <View style={styles.pickerContainer}>
                            <Picker selectedValue={tribunalSelecionado} onValueChange={(itemValue) => { setTribunalSelecionado(itemValue); if (itemValue !== tribunalSelecionado) { setDados([]); setUltimaPaginacao(null); } }} style={styles.picker} enabled={tribunaisFiltrados.length > 1} dropdownIconColor={styles.pickerDropdownColor}>
                                {tribunaisFiltrados.map((tribunal) => ( <Picker.Item key={tribunal.url || 'select-tribunal'} label={tribunal.url === '' ? '2. Selecione o Tribunal' : tribunal.nome} value={tribunal.url} style={tribunalSelecionado !== '' && tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                            </Picker>
                        </View>)}
                        <View style={styles.inputContainer}>
                            <TextInput style={styles.inputField} placeholder="Digite apenas os 20 números" value={input} onChangeText={(text)=>{ const numericText = text.replace(/[^0-9]/g,''); if(numericText.length <= 20){ setInput(numericText);}}} keyboardType={'numeric'} maxLength={20} onSubmitEditing={()=>buscarDados(false)} returnKeyType="search" editable={!carregando}/>
                            {input.length > 0 && !carregando && (<Pressable onPress={limparInput} style={styles.clearButton}><Ionicons name="close-circle" size={22} color={styles.clearButtonColor} /></Pressable>)}
                        </View>
                        {historico.length > 0 && !carregando && ( <View style={styles.pickerContainer}>
                            <Picker selectedValue={historicoSelecionadoId} onValueChange={(itemValue) => handleHistoricoSelect(itemValue)} style={styles.picker} dropdownIconColor={styles.pickerDropdownColor}>
                                <Picker.Item label="Últimas 10 Buscas (Selecione)" value="" style={styles.pickerItemStyle} />
                                {historico.map((item) => (
                                    <Picker.Item
                                        key={item.id}
                                        label={`${item.numero} - ${item.tribunalNome.substring(0, 35)}${item.tribunalNome.length > 35 ? '...' : ''}`}
                                        value={item.id}
                                        style={historicoSelecionadoId === item.id ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} />
                                ))}
                            </Picker>
                        </View> )}
                        <Pressable style={({ pressed }) => [styles.actionButton, styles.buscarButton, { opacity: pressed ? 0.7 : 1 }]} onPress={() => buscarDados(false)} disabled={carregando || !tribunalSelecionado || !input.trim() || input.trim().length < 7}>
                            <Feather name="search" size={20} color={styles.actionButtonIconColor} /><Text style={styles.actionButtonText}>Buscar</Text>
                        </Pressable>
                        {dados.length > 0 && !carregando && ( <Pressable style={({ pressed }) => [styles.actionButton, styles.novaPesquisaButton, { opacity: pressed ? 0.7 : 1 }]} onPress={limparTela} disabled={carregando} >
                            <Ionicons name="refresh-outline" size={20} color={styles.actionButtonIconColorAlt} /><Text style={[styles.actionButtonText, { color: styles.actionButtonTextColorAlt }]}>Nova Pesquisa</Text>
                        </Pressable> )}
                        {carregando && ( <ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} /> )}
                    </View>
                }
                data={dados}
                keyExtractor={(item, index) => item._id || `processo-${index}`}
                // --- Renderização de Cada Item da Lista com Botão Favorito ---
                renderItem={({ item }) => {
                    const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};

                    // Lógica para verificar se é favorito
                    const numeroProcesso = d.numeroProcesso;
                    const tribunalNomeApi = d.tribunal;
                    const tribunalInfo = tribunais.find(t => t.nome.toUpperCase().includes(tribunalNomeApi?.toUpperCase() || '') || t.sigla?.toUpperCase() === tribunalNomeApi?.toUpperCase());
                    const tribunalUrl = tribunalInfo ? tribunalInfo.url : tribunalSelecionado;
                    const favoritoId = `${numeroProcesso}-${tribunalUrl}`;
                    const isFavorito = favoritos.some(fav => fav.id === favoritoId);

                    // ... Sua lógica de extração de dados ...
                    const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []); const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || ''; const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || ''; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ') : ''; return `(${polo || 'N/I'}) ${nome} ${tipoPessoa ? `[${tipoPessoa}]` : ''}${documento ? ` (Doc: ${documento})` : ''}${advogadosFormatados}`; }).join('\n\n') : 'Partes não informadas';
                    const movimentosArray = d.movimentos || d.movimento; const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = `\n     -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? `\n     -> ${complementoTexto}` : ''; return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Sem movimentações registradas.';
                    const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';
                    const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
                    const assuntosTexto = Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'Não informado');
                    const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                    const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
                    const custas = dadosBasicos.custasRecolhidas;
                    const juizo100 = dadosBasicos.juizo100Digital;

                    return (
                        <View style={[styles.item, { position: 'relative' }]}>
                            {/* Botão de Favoritar */}
                            {numeroProcesso && tribunalUrl && ( // Renderiza botão apenas se tiver dados
                                <Pressable
                                    onPress={() => toggleFavorito(item)}
                                    style={styles.favoriteButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={isFavorito ? "star" : "star-outline"}
                                        size={28}
                                        color={isFavorito ? styles.favoriteStarColorActive : styles.favoriteStarColorInactive}
                                    />
                                </Pressable>
                            )}

                            {/* Seu conteúdo original do item */}
                            <Text style={styles.tituloProcesso} selectable={true}><Text>📄 Processo: </Text><Text style={styles.valor}>{d.numeroProcesso || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏛️ Tribunal: </Text><Text style={styles.valor}>{d.tribunal || 'N/D'}</Text><Text> | Grau: </Text><Text style={styles.valor}>{d.grau || 'N/D'}</Text><Text> | Sigilo: </Text><Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏷️ Classe: </Text><Text style={styles.valor}>{d.classe?.codigo ? `(${d.classe.codigo}) ` : ''}{d.classe?.nome || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📍 Órgão Julgador: </Text><Text style={styles.valor}>{`${orgaoTexto}${d.orgaoJulgador?.codigo ? ` (${d.orgaoJulgador.codigo})` : ''}`}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📅 Ajuizamento: </Text><Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>💰 Valor Causa: </Text><Text style={styles.valor}>{valorCausaTexto}</Text></Text>
                            {(custas !== undefined && custas !== null) && <Text style={styles.linha} selectable={true}><Text>💲 Custas Recolhidas: </Text><Text style={styles.valor}>{custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text> }
                            {prioridades ? <Text style={styles.linha} selectable={true}><Text>🚩 Prioridade(s): </Text><Text style={styles.valor}>{prioridades}</Text></Text> : null }
                            {(juizo100 === true || juizo100 === false) ? <Text style={styles.linha} selectable={true}><Text>💻 Juízo 100% Digital: </Text><Text style={styles.valor}>{juizo100 ? 'Sim' : 'Não'}</Text></Text> : null }
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes:</Text><Text style={styles.valor} selectable={true}>{partesFormatadas}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Últimas 15):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
                        </View>
                    );
                }}

                // --- Rodapé da Lista ---
                ListFooterComponent={
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {dados.length > 0 && ultimaPaginacao && !carregando && (
                                <Pressable style={({ pressed }) => [styles.actionButton, styles.carregarMaisButton, { opacity: pressed ? 0.7 : 1 }]} onPress={() => buscarDados(true)} disabled={carregando}>
                                    <MaterialCommunityIcons name="arrow-down-circle-outline" size={20} color={styles.actionButtonIconColor} />
                                    <Text style={styles.actionButtonText}>Carregar mais</Text>
                                </Pressable>
                            )}
                            {dados.length > 0 && !carregando && (
                                <View style={styles.shareButtonsContainer}>
                                    <View style={styles.shareButtonItemWrapper}>
                                        <Pressable style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1, backgroundColor: styles.primaryColor }]} onPress={onShareTexto} disabled={carregando}>
                                            <Ionicons name="share-social-outline" size={20} color={styles.iconButtonIconColor} />
                                            <Text style={styles.iconButtonText}>Resultado</Text>
                                        </Pressable>
                                    </View>
                                    <View style={styles.shareButtonItemWrapper}>
                                        <Pressable style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1, backgroundColor: styles.primaryColor }]} onPress={handleGeneratePdf} disabled={carregando}>
                                            <MaterialCommunityIcons name="file-pdf-box" size={20} color={styles.iconButtonIconColor} />
                                            <Text style={styles.iconButtonText}>Gerar PDF</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : null
                }

                // --- Componente Lista Vazia ---
                ListEmptyComponent={
                    !carregando && tribunalSelecionado && input.trim().length >= 7 && dados.length === 0 ? ( <View style={{alignItems: 'center', marginTop: 50}}><Text style={styles.textoInfo}>Nenhum resultado encontrado para esta busca.</Text></View> ) : null
                }
            />
        </View>
    );
}

// --- Função de Estilos Dinâmicos ---
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f8f9fa'; const textColor = isDark ? '#e0e0e0' : '#212529'; const borderColor = isDark ? '#444' : '#ced4da'; const placeholderTextColor = isDark ? '#777' : '#6c757d'; const primaryColor = isDark ? '#66bfff' : '#007bff'; const secondaryButtonColor = isDark ? '#ffcc66' : '#FFA500'; const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; const itemBorderColor = primaryColor; const titleColor = isDark ? '#bbdffd' : '#003366'; const valueColor = isDark ? '#cccccc' : '#343a40'; const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff'; const pickerItemBgSelected = isDark ? '#004c99' : '#cfe2ff'; const pickerItemColorSelected = isDark ? '#ffffff' : '#003d99'; const pickerDropdownColor = isDark ? '#aaaaaa' : '#888888'; const infoTextColor = isDark ? '#aaaaaa' : '#6c757d'; const iconButtonIconColor = '#ffffff'; const iconButtonTextColor = '#ffffff'; const actionButtonTextColorAlt = isDark ? '#111' : '#222'; const clearButtonColor = isDark ? '#888' : '#777';
    // --- Cores para Favorito ---
    const favoriteStarColorActive = isDark ? '#FFD700' : '#FFA500';
    const favoriteStarColorInactive = isDark ? '#777' : '#aaa';

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor }, contentContainer: { paddingHorizontal: 15, paddingVertical: 20, paddingBottom: 40 }, titulo: { fontSize: 20, marginBottom: 15, fontWeight: 'bold', color: textColor, textAlign: 'center' },
        inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: borderColor, borderRadius: 5, marginBottom: 15, backgroundColor: isDark ? '#2a2a2a' : '#fff', }, inputField: { flex: 1, color: textColor, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, }, clearButton: { padding: 8, }, clearButtonColor: clearButtonColor,
        pickerContainer: { borderWidth: 1, borderColor: borderColor, borderRadius: 5, marginBottom: 15, backgroundColor: pickerBackgroundColor, justifyContent: 'center' }, picker: { color: textColor, height: 50 }, pickerItemStyle: { color: textColor, backgroundColor: pickerBackgroundColor, fontSize: 16 }, pickerItemSelectedStyle: { color: pickerItemColorSelected, backgroundColor: pickerItemBgSelected, fontSize: 16, fontWeight: 'bold' }, pickerDropdownColor: pickerDropdownColor,
        actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 5, marginVertical: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, }, buscarButton: { backgroundColor: primaryColor, }, novaPesquisaButton: { backgroundColor: secondaryButtonColor, }, carregarMaisButton: { backgroundColor: primaryColor, }, actionButtonIconColor: iconButtonIconColor, actionButtonIconColorAlt: actionButtonTextColorAlt, actionButtonText: { color: iconButtonTextColor, marginLeft: 10, fontSize: 16, fontWeight: 'bold', }, actionButtonTextColorAlt: { color: actionButtonTextColorAlt, },
        item: { padding: 15, marginVertical: 8, backgroundColor: itemBackgroundColor, borderLeftWidth: 5, borderLeftColor: itemBorderColor, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 2, elevation: 2, paddingRight: 45 }, // Padding para botão favorito
        tituloProcesso: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: titleColor, paddingRight: 10 }, // Padding para botão favorito
        linha: { fontSize: 15, marginBottom: 2, color: textColor, lineHeight: 22 }, valor: { color: valueColor, fontWeight: 'normal', fontSize: 15, lineHeight: 22 },
        activityIndicator: { marginVertical: 20 }, footerButtons: { marginTop: 20, paddingBottom: 30 }, textoInfo: { fontSize: 16, color: infoTextColor, textAlign: 'center' }, placeholderTextColor: placeholderTextColor, primaryColor: primaryColor, secondaryButtonColor: secondaryButtonColor,
        shareButtonsContainer: { flexDirection: 'row', marginTop: 15, marginHorizontal: -5, }, shareButtonItemWrapper: { flex: 1, marginHorizontal: 5, }, iconButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, }, iconButtonIconColor: iconButtonIconColor, iconButtonText: { color: iconButtonTextColor, marginLeft: 8, fontSize: 14, fontWeight: 'bold', },
        // --- Estilos Botão Favorito ---
        favoriteButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            padding: 5,
            zIndex: 1,
        },
        favoriteStarColorActive: favoriteStarColorActive,
        favoriteStarColorInactive: favoriteStarColorInactive,
    });
}