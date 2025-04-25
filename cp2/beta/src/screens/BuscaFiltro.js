// --- src/screens/BuscaFiltro.js ---
// CORRIGIDO: ReferenceError: formatarData + Tentativa de correção Warning Text

import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert,
    ActivityIndicator, Keyboard, Share, Platform, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect
import { useThemeContext } from '../context/ThemeContext';

// --- Constantes ---
const CNJ_API_BASE_URL = 'https://api-publica.datajud.cnj.jus.br';
const CNJ_API_KEY = "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
const ITEMS_PER_PAGE = 10;

// --- Função Helper para formatar Data para API (YYYY-MM-DD) ---
const formatDateForAPI = (date) => {
    if (!date) return null;
    try {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if (year < 1900 || year > 2100) return null;
        return `${year}-${month}-${day}`;
    } catch (e) { console.error("Erro ao formatar data para API:", date, e); return null; }
};

export default function BuscaFiltro({ navigation }) {
    // --- States ---
    const [dados, setDados] = useState([]); const [carregando, setCarregando] = useState(false); const [tribunalSelecionado, setTribunalSelecionado] = useState(''); const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState(''); const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]); const [ultimaPaginacao, setUltimaPaginacao] = useState(null); const [erro, setErro] = useState(null); const [classeInput, setClasseInput] = useState(''); const [orgaoInput, setOrgaoInput] = useState(''); const [dataInicio, setDataInicio] = useState(null); const [dataFim, setDataFim] = useState(null); const [showDatePicker, setShowDatePicker] = useState(null);

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Listas de Tipos e Tribunais (MANTIDA) ---
    const tiposJustica = [ /* ... Sua lista completa ... */ { label: 'Tribunais Superiores', value: 'Superior' }, { label: 'Justiça Federal', value: 'Federal' }, { label: 'Justiça Estadual', value: 'Estadual' }, { label: 'Justiça do Trabalho', value: 'Trabalho' }, { label: 'Justiça Eleitoral', value: 'Eleitoral' }, { label: 'Justiça Militar', value: 'Militar' }];
    const tribunais = [ /* ... Sua lista completa ... */ { nome: 'Selecione um tribunal', url: '', tipo: '' }, { nome: 'Tribunal Superior do Trabalho - TST', url: 'api_publica_tst', tipo: 'Superior' }, { nome: 'Tribunal Superior Eleitoral - TSE', url: 'api_publica_tse', tipo: 'Superior' }, { nome: 'Tribunal Superior de Justiça - STJ', url: 'api_publica_stj', tipo: 'Superior' }, { nome: 'Tribunal Superior Militar - TSM', url: 'api_publica_stm', tipo: 'Superior' }, { nome: 'Tribunal Regional Federal da 1ª Região - TRF1', url: 'api_publica_trf1', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 2ª Região - TRF2', url: 'api_publica_trf2', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 3ª Região - TRF3', url: 'api_publica_trf3', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 4ª Região - TRF4', url: 'api_publica_trf4', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 5ª Região - TRF5', url: 'api_publica_trf5', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 6ª Região - TRF6', url: 'api_publica_trf6', tipo: 'Federal' }, { nome: 'Tribunal de Justiça do Acre - TJ-AC', url: 'api_publica_tjac', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Alagoas - TJ-AL', url: 'api_publica_tjal', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Amapá - TJ-AP', url: 'api_publica_tjap', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Amazonas - TJ-AM', url: 'api_publica_tjam', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça da Bahia - TJ-BA', url: 'api_publica_tjba', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Ceará - TJ-CE', url: 'api_publica_tjce', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Distrito Federal - TJ-DF', url: 'api_publica_tjdft', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Espírito Santo - TJ-ES', url: 'api_publica_tjes', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Goiás - TJ-GO', url: 'api_publica_tjgo', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Maranhão - TJ-MA', url: 'api_publica_tjma', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Minas Gerais - TJ-MG', url: 'api_publica_tjmg', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Mato Grosso do Sul - TJ-MS', url: 'api_publica_tjms', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Mato Grosso - TJ-MT', url: 'api_publica_tjmt', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Pará - TJ-PA', url: 'api_publica_tjpa', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça da Paraíba - TJ-PB', url: 'api_publica_tjpb', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Paraná - TJ-PR', url: 'api_publica_tjpr', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Pernambuco - TJ-PE', url: 'api_publica_tjpe', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Piauí - TJ-PI', url: 'api_publica_tjpi', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio de Janeiro - TJ-RJ', url: 'api_publica_tjrj', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio Grande do Norte - TJ-RN', url: 'api_publica_tjrn', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio Grande do Sul - TJ-RS', url: 'api_publica_tjrs', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Rondônia - TJ-RO', url: 'api_publica_tjro', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Roraima - TJ-RR', url: 'api_publica_tjrr', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Santa Catarina - TJ-SC', url: 'api_publica_tjsc', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de São Paulo TJ-SP', url: 'api_publica_tjsp', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Sergipe -TJ-SE', url: 'api_publica_tjse', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Tocantins - TJ-TO', url: 'api_publica_tjto', tipo: 'Estadual' }, { nome: 'Tribunal Regional do Trabalho da 1ª Região - TRT1', url: 'api_publica_trt1', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 2ª Região - TRT2', url: 'api_publica_trt2', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 3ª Região - TRT3', url: 'api_publica_trt3', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 4ª Região - TRT4', url: 'api_publica_trt4', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 5ª Região - TRT5', url: 'api_publica_trt5', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 6ª Região - TRT6', url: 'api_publica_trt6', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 7ª Região - TRT7', url: 'api_publica_trt7', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 8ª Região - TRT8', url: 'api_publica_trt8', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 9ª Região - TRT9', url: 'api_publica_trt9', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 10ª Região - TRT10', url: 'api_publica_trt10', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 11ª Região - TRT11', url: 'api_publica_trt11', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 12ª Região - TRT12', url: 'api_publica_trt12', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 13ª Região - TRT13', url: 'api_publica_trt13', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 14ª Região - TRT14', url: 'api_publica_trt14', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 15ª Região - TRT15', url: 'api_publica_trt15', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 16ª Região - TRT16', url: 'api_publica_trt16', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 17ª Região - TRT17', url: 'api_publica_trt17', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 18ª Região - TRT18', url: 'api_publica_trt18', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 19ª Região - TRT19', url: 'api_publica_trt19', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 20ª Região - TRT20', url: 'api_publica_trt20', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 21ª Região - TRT21', url: 'api_publica_trt21', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 22ª Região - TRT22', url: 'api_publica_trt22', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 23ª Região - TRT23', url: 'api_publica_trt23', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 24ª Região - TRT24', url: 'api_publica_trt24', tipo: 'Trabalho' }, { nome: 'Tribunal Regional Eleitoral do Acre - TRE-AC', url: 'api_publica_tre-ac', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Alagoas - TRE-AL', url: 'api_publica_tre-al', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Amapá - TRE-AP', url: 'api_publica_tre-ap', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Amazonas - TRE-AM', url: 'api_publica_tre-am', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral da Bahia - TRE-BA', url: 'api_publica_tre-ba', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Ceará - TRE-CE', url: 'api_publica_tre-ce', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Distrito Federal - TRE-DF', url: 'api_publica_tre-df', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Espírito Santo - TRE-ES', url: 'api_publica_tre-es', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Goiás - TRE-GO', url: 'api_publica_tre-go', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Maranhão - TRE-MA', url: 'api_publica_tre-ma', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Minas Gerais - TRE-MG', url: 'api_publica_tre-mg', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Mato Grosso do Sul - TRE-MS', url: 'api_publica_tre-ms', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Mato Grosso - TRE-MT', url: 'api_publica_tre-mt', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Pará - TRE-PA', url: 'api_publica_tre-pa', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral da Paraíba - TRE-PB', url: 'api_publica_tre-pb', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Paraná - TRE-PR', url: 'api_publica_tre-pr', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Pernambuco - TRE-PE', url: 'api_publica_tre-pe', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Piauí - TRE-PI', url: 'api_publica_tre-pi', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio de Janeiro - TRE-RJ', url: 'api_publica_tre-rj', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio Grande do Norte - TRE-RN', url: 'api_publica_tre-rn', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul - TRE-RS', url: 'api_publica_tre-rs', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Rondônia - TRE-RO', url: 'api_publica_tre-ro', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Roraima - TRE-RR', url: 'api_publica_tre-rr', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Santa Catarina - TRE-SC', url: 'api_publica_tre-sc', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de São Paulo - TRE-SP', url: 'api_publica_tre-sp', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Sergipe - TRE-SE', url: 'api_publica_tre-se', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Tocantins - TRE-TO', url: 'api_publica_tre-to', tipo: 'Eleitoral' }, { nome: 'Tribunal de Justiça Militar de Minas Gerais -TJM-MG', url: 'api_publica_tjmmg', tipo: 'Militar' }, { nome: 'Tribunal de Justiça Militar do Rio Grande do Sul - TJM-RS', url: 'api_publica_tjmrs', tipo: 'Militar' }, { nome: 'Tribunal de Justiça Militar de São Paulo - TJM-SP', url: 'api_publica_tjmsp', tipo: 'Militar' },
    ];


    // --- Funções Auxiliares ---
    const limparTelaEInputs = useCallback(() => {
        setDados([]); setClasseInput(''); setOrgaoInput(''); setDataInicio(null);
        setDataFim(null); setTribunalSelecionado(''); setTipoJusticaSelecionado('');
        setTribunaisFiltrados([]); setUltimaPaginacao(null); setErro(null);
        Keyboard.dismiss();
    }, []);

    // <<< CORRIGIDO: formatarData e formatarDataDisplay agora estão DEFINIDAS AQUI >>>
    const formatarData = useCallback((dataStr) => {
        if (!dataStr) return "Não informada";
        try {
            const date = new Date(dataStr); if (isNaN(date.getTime())) return dataStr;
            if (dataStr.includes('T') || dataStr.includes(':')) { return date.toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' }); }
            else { return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); }
        } catch (e) { console.error("Erro ao formatar data:", dataStr, e); return dataStr; }
    }, []);

    const formatarDataDisplay = useCallback((date) => {
        if (!date) return null;
        return date.toLocaleDateString('pt-BR');
    }, []);
    // <<< FIM DA CORREÇÃO >>>

    // --- Limpa Erro e Dados ao Focar na Tela ---
    useFocusEffect(
        useCallback(() => {
            setErro(null); setDados([]); setUltimaPaginacao(null);
            return () => {};
        }, [])
    );

    // --- Lógica do DatePicker ---
    const onChangeDate = useCallback((event, selectedDate) => {
        const datePickerType = showDatePicker; setShowDatePicker(null);
        if (event.type === 'set') {
            const currentDate = selectedDate;
            if (datePickerType === 'inicio') {
                setDataInicio(currentDate);
                if (dataFim && currentDate > dataFim) { setDataFim(null); Alert.alert("Data Inválida", "Data inicial > data final."); }
            } else if (datePickerType === 'fim') {
                setDataFim(currentDate);
                if (dataInicio && currentDate < dataInicio) { setDataInicio(null); Alert.alert("Data Inválida", "Data final < data inicial."); }
            }
        }
    }, [showDatePicker, dataInicio, dataFim]);

    const showDatepickerFor = useCallback((field) => { Keyboard.dismiss(); setShowDatePicker(field); }, []);
    // --- Fim da Lógica do DatePicker ---

    // --- Função de Busca por Filtros ---
    const buscarComFiltros = useCallback(async (paginando = false) => {
        Keyboard.dismiss();
        if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; }
        const classeTrimmed = classeInput.trim(); const orgaoTrimmed = orgaoInput.trim();
        if (!classeTrimmed && !orgaoTrimmed && !dataInicio && !dataFim) { Alert.alert("Erro", "Informe pelo menos um filtro."); return; }

        setCarregando(true); setErro(null);
        if (!paginando) { setDados([]); setUltimaPaginacao(null); }

        try {
            const url = `${CNJ_API_BASE_URL}/${tribunalSelecionado}/_search`; const filters = [];
            if (classeTrimmed) { const classeNum = parseInt(classeTrimmed); if (!isNaN(classeNum)) { filters.push({ term: { "classe.codigo": classeNum } }); } else { Alert.alert("Erro", "Código da Classe inválido."); setCarregando(false); return; } }
            if (orgaoTrimmed) { const orgaoNum = parseInt(orgaoTrimmed); if (!isNaN(orgaoNum)) { filters.push({ term: { "orgaoJulgador.codigo": orgaoNum } }); } else { Alert.alert("Erro", "Código do Órgão inválido."); setCarregando(false); return; } }
            const rangeQuery = {}; const dataInicioAPI = formatDateForAPI(dataInicio); const dataFimAPI = formatDateForAPI(dataFim);
            if (dataInicioAPI) { rangeQuery.gte = dataInicioAPI; } if (dataFimAPI) { rangeQuery.lte = dataFimAPI; }
            if (Object.keys(rangeQuery).length > 0) { filters.push({ range: { dataAjuizamento: rangeQuery } }); }

            let query = { size: ITEMS_PER_PAGE, query: { bool: { filter: filters } }, sort: [{ "@timestamp": { "order": "asc" } }] };
            if (paginando && ultimaPaginacao) { query.search_after = ultimaPaginacao; }

            console.log(`Buscando com Filtros - URL: ${url} - Paginando: ${paginando}`); console.log("Query:", JSON.stringify(query));
            const resposta = await axios.post(url, query, { headers: { Authorization: CNJ_API_KEY, 'Content-Type': 'application/json' }, timeout: 45000 });
            console.log("Resposta API:", resposta.status);

            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits; setDados(prev => paginando ? [...prev, ...novosDados] : novosDados); const ultimo = novosDados[novosDados.length - 1]; setUltimaPaginacao(ultimo?.sort || null);
            } else {
                if (!paginando) { setDados([]); Alert.alert("Não Encontrado", "Nenhum processo com os filtros."); } else { Alert.alert("Fim dos Resultados", "Não há mais processos."); }
                setUltimaPaginacao(null);
            }
        } catch (erro) {
            console.error("Erro busca filtros:", erro); setDados([]); setUltimaPaginacao(null);
            let errorMsg = "Falha busca filtrada."; let errorDetail = "";
            if (erro.response) { errorDetail = JSON.stringify(erro.response.data?.error || erro.response.data || ''); errorMsg += `\nStatus ${erro.response.status}. ${errorDetail}`; console.error("Erro API:", erro.response.status, erro.response.data); if (erro.response.status === 401) { errorMsg = "Erro Autenticação: API Key?"; } else if (erro.response.status === 404) { errorMsg = `Erro: Tribunal/Recurso não encontrado (${tribunalSelecionado}).`; } else if (erro.response.status >= 500) { errorMsg = "Erro servidor CNJ."; } }
            else if (erro.request) { errorMsg = "Sem resposta servidor (Timeout/Rede)."; } else { errorMsg = `Erro: ${erro.message}`; }
            Alert.alert("Erro Busca", errorMsg); setErro(errorMsg); console.error("Erro Obj:", erro);
        } finally { setCarregando(false); }
    }, [tribunalSelecionado, classeInput, orgaoInput, dataInicio, dataFim, ultimaPaginacao]); // Removido formatarData das dependências

    // --- Função de Compartilhar ---
    const onShare = useCallback(async () => {
        if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para compartilhar."); return; }
        try {
            let filtrosUsados = `Tribunal: ${tribunais.find(t => t.url === tribunalSelecionado)?.nome || tribunalSelecionado}`;
            if (classeInput.trim()) filtrosUsados += `\nClasse Cód: ${classeInput.trim()}`; if (orgaoInput.trim()) filtrosUsados += `\nÓrgão Cód: ${orgaoInput.trim()}`;
            if (dataInicio) filtrosUsados += `\nData Início: ${formatarDataDisplay(dataInicio)}`; if (dataFim) filtrosUsados += `\nData Fim: ${formatarDataDisplay(dataFim)}`;
            let message = `Consulta Processual Filtrada:\n${filtrosUsados}\n--- Resultados (início) ---\n`; const limiteResultadosShare = 5;
            dados.slice(0, limiteResultadosShare).forEach((item, index) => {
                const d = item._source || {}; const numeroProcesso = d.numeroProcesso || 'N/D'; const classeNome = d.classe?.nome || 'N/D'; const dataAjuizamento = formatarData(d.dataAjuizamento); const assuntos = Array.isArray(d.assuntos) ? d.assuntos.map(a=>a.nome).slice(0,1).join('') : '';
                message += `\n${index + 1}. ${numeroProcesso}\n   Classe: ${classeNome}\n   Ajuiz.: ${dataAjuizamento}`; if (assuntos) message += `\n   Assunto: ${assuntos}...`; message += `\n`;
            });
            if(dados.length > limiteResultadosShare) { message += `\n... e mais ${dados.length - limiteResultadosShare} resultados.\n`; } message += `--------------------\n`;
            await Share.share({ message });
        } catch (error) { Alert.alert("Erro", `Falha ao compartilhar: ${error.message}`); console.error("Erro ao compartilhar:", error); }
        // <<< CORRIGIDO: Adicionado formatarDataDisplay às dependências >>>
    }, [dados, tribunalSelecionado, classeInput, orgaoInput, dataInicio, dataFim, tribunais, formatarDataDisplay, formatarData]);

    // --- Determina se pode carregar mais ---
    const podeCarregarMais = () => { return !carregando && !!ultimaPaginacao; };

    // --- Render Item (Função agora definida DENTRO do componente) ---
    // useCallback aqui garante que a função não seja recriada a cada render,
    // otimizando a FlatList, e dá acesso ao escopo (formatarData)
    const renderItem = useCallback(({ item }) => {
        const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {}; const numeroProcesso = d.numeroProcesso || 'N/D'; const tribunal = d.tribunal || 'N/D'; const grau = d.grau || 'N/D';
        const sigiloMap = { 0: 'Público', 1: 'Segredo Nível 1', 2: 'Segredo Nível 2', 3: 'Segredo Nível 3', 4: 'Segredo Nível 4', 5: 'Segredo Nível 5' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'N/I'; const classeCodigo = d.classe?.codigo; const classeNome = d.classe?.nome || 'N/D'; const orgaoTexto = d.orgaoJulgador?.nome || 'N/D'; const orgaoCodigo = d.orgaoJulgador?.codigo;
        const dataAjuizamento = formatarData(d.dataAjuizamento); // Chama a função formatarData do escopo
        const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I'; const formatoProcesso = d.formato?.nome || 'N/I'; const sistemaProcessual = d.sistema?.nome || 'N/I';
        const assuntosTexto = Array.isArray(d.assuntos) ? d.assuntos.map(a => `${a.nome || '?'} (${a.codigo || '?'})`).join(' | ') : 'N/I'; const partesFormatadas = (d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []))?.map(pt => `(${pt.polo?.sigla || '?'}) ${pt.nome || pt.pessoa?.nome || '?'}`).slice(0, 5).join('\n') + ((d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []))?.length > 5 ? '\n...' : '') || 'N/I';
        const movimentacoes = (d.movimentos || d.movimento)?.slice(0, 5).map(m => `📌 ${formatarData(m.dataHora)}: ${m.nome || m.movimentoNacional?.descricao || '?'}`).join('\n') + ((d.movimentos?.length > 5) ? '\n...' : '') || 'N/I'; // Chama formatarData aqui também

        // Correção Warning Text: Garante que condicionais retornem null ou elementos, não strings/booleanos diretamente na View
        const sistemaFormatado = sistemaProcessual !== 'N/I' ? (<><Text>⚙️ Sistema: </Text><Text style={styles.valor}>{sistemaProcessual}</Text></>) : null;
        const formatoFormatado = formatoProcesso !== 'N/I' ? (<><Text>Formato: </Text><Text style={styles.valor}>{formatoProcesso}</Text></>) : null;
        const separadorSistemaFormato = sistemaFormatado && formatoFormatado ? <Text> | </Text> : null;

        return (
            <View style={styles.item}>
                <Text style={styles.tituloProcesso} selectable={true}>📄 Processo: <Text style={styles.valor}>{numeroProcesso}</Text></Text>
                <Text style={styles.linha} selectable={true}>🏛️ Tribunal: <Text style={styles.valor}>{tribunal}</Text> | Grau: <Text style={styles.valor}>{grau}</Text> | Sigilo: <Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>
                { (sistemaFormatado || formatoFormatado) ? ( // Renderiza a linha só se houver sistema ou formato
                    <Text style={styles.linha} selectable={true}>
                        {sistemaFormatado}
                        {separadorSistemaFormato}
                        {formatoFormatado}
                    </Text>
                ) : null }
                <Text style={styles.linha} selectable={true}>🏷️ Classe: <Text style={styles.valor}>{classeCodigo ? `(${classeCodigo}) ` : ''}{classeNome}</Text></Text>
                <Text style={styles.linha} selectable={true}>📍 Órgão Julgador: <Text style={styles.valor}>{orgaoTexto} {orgaoCodigo ? `(${orgaoCodigo})` : ''}</Text></Text>
                <Text style={styles.linha} selectable={true}>📅 Ajuizamento: <Text style={styles.valor}>{dataAjuizamento}</Text></Text>
                <Text style={styles.linha} selectable={true}>💰 Valor Causa: <Text style={styles.valor}>{valorCausaTexto}</Text></Text>
                <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes (Resumo):</Text><Text style={styles.valor} selectable={true}>{partesFormatadas}</Text></View>
                <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Resumo):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
            </View>
        );
        // Adiciona formatarData como dependência do useCallback do renderItem
    }, [formatarData, styles]); // Inclui styles se eles puderem mudar com o tema

    // --- Renderização da Tela ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={ // Cabeçalho com todos os filtros
                    <View>
                        <Text style={styles.titulo}>Busca Avançada por Filtros</Text>
                        {/* Pickers de Tribunal */}
                        <View style={styles.pickerContainer}><Picker selectedValue={tipoJusticaSelecionado} onValueChange={(itemValue) => { setTipoJusticaSelecionado(itemValue); const filtrados = tribunais.filter(t => t.tipo === itemValue || t.url === ''); setTribunaisFiltrados(filtrados); setTribunalSelecionado(''); setDados([]); setUltimaPaginacao(null); setErro(null); }} style={styles.picker} dropdownIconColor={styles.pickerDropdownColor}><Picker.Item label="1. Tipo de Justiça" value="" style={styles.pickerItemStyle} />{tiposJustica.map((tipo, i) => ( <Picker.Item key={`${tipo.value}-${i}`} label={tipo.label} value={tipo.value} style={tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}</Picker></View>
                        {tipoJusticaSelecionado ? (<View style={styles.pickerContainer}><Picker selectedValue={tribunalSelecionado} onValueChange={(itemValue) => { setTribunalSelecionado(itemValue); if (itemValue !== tribunalSelecionado) { setDados([]); setUltimaPaginacao(null); setErro(null); } }} style={styles.picker} enabled={!!tipoJusticaSelecionado && tribunaisFiltrados.length > 1} dropdownIconColor={styles.pickerDropdownColor}>{tribunaisFiltrados.map((tribunal, i) => ( <Picker.Item key={`${tribunal.url}-${i}-${tribunal.nome}`} label={tribunal.url === '' ? '2. Tribunal' : tribunal.nome} value={tribunal.url} style={tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}</Picker></View>) : null }
                        {/* Filtros Adicionais */}
                        { tribunalSelecionado ? <>
                            <Text style={styles.labelFiltro}>Filtros Adicionais (Opcionais):</Text>
                            <TextInput style={styles.input} placeholder="Código da Classe (ex: 31)" placeholderTextColor={styles.placeholderTextColor} value={classeInput} onChangeText={setClasseInput} keyboardType={'numeric'} returnKeyType="next" editable={!carregando} />
                            <TextInput style={styles.input} placeholder="Código do Órgão Julgador (ex: 9680)" placeholderTextColor={styles.placeholderTextColor} value={orgaoInput} onChangeText={setOrgaoInput} keyboardType={'numeric'} returnKeyType="next" editable={!carregando} />
                            <View style={styles.dateContainer}>
                                <TouchableOpacity onPress={() => showDatepickerFor('inicio')} style={styles.dateButton}><Text style={styles.dateButtonText}>{dataInicio ? `Início: ${formatarDataDisplay(dataInicio)}` : 'Data Início'}</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => showDatepickerFor('fim')} style={styles.dateButton}><Text style={styles.dateButtonText}>{dataFim ? `Fim: ${formatarDataDisplay(dataFim)}` : 'Data Fim'}</Text></TouchableOpacity>
                            </View>
                            {showDatePicker && (<DateTimePicker testID="dateTimePicker" value={showDatePicker === 'inicio' ? (dataInicio || new Date()) : (dataFim || new Date())} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} /> )}
                            <View style={styles.buttonContainer}><Button title="Buscar com Filtros" onPress={() => buscarComFiltros(false)} disabled={carregando || !tribunalSelecionado || (!classeInput.trim() && !orgaoInput.trim() && !dataInicio && !dataFim)} color={styles.primaryColor} /></View>
                            {(dados.length > 0 || carregando || erro || classeInput || orgaoInput || dataInicio || dataFim) && (<View style={styles.buttonContainer}><Button title="Limpar Busca" onPress={limparTelaEInputs} color={styles.secondaryButtonColor} disabled={carregando}/></View> )}
                        </> : null }
                        {/* Indicador de Loading e Erro */}
                        {carregando && ( <ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} /> )}
                        {erro && !carregando && !dados.length ? ( <Text style={styles.errorText}>Erro: {erro}</Text> ) : null }
                    </View>
                }
                data={dados}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={renderItem} // <<< Passa a função renderItem definida acima
                ListFooterComponent={ // Rodapé da Lista
                    (dados.length > 0 || carregando) ? ( <View style={styles.footerButtons}> {podeCarregarMais() && !carregando && (<View style={styles.buttonContainer}><Button title="Carregar mais" onPress={() => buscarComFiltros(true)} disabled={carregando} color={styles.primaryColor} /></View>)} {dados.length > 0 && !carregando && (<View style={styles.buttonContainer}><Button title="Compartilhar" onPress={onShare} color={styles.primaryColor} /></View>)} </View> ) : null
                }
                ListEmptyComponent={ // Mensagem se busca não retornar nada
                    !carregando && !erro && tribunalSelecionado && (classeInput || orgaoInput || dataInicio || dataFim) ? ( <View style={styles.emptyContainer}><Text style={styles.textoInfo}>Nenhum processo encontrado.</Text></View> ) : null
                }
            />
        </View>
    );
}


// --- Estilos ---
// (Função getThemedStyles como na resposta anterior)
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f8f9fa'; const textColor = isDark ? '#e0e0e0' : '#212529'; const borderColor = isDark ? '#444' : '#ced4da'; const placeholderTextColor = isDark ? '#777' : '#6c757d'; const primaryColor = isDark ? '#66bfff' : '#007bff'; const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; const itemBorderColor = primaryColor; const titleColor = isDark ? '#bbdffd' : '#003366'; const valueColor = isDark ? '#cccccc' : '#343a40'; const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff'; const pickerItemBgSelected = isDark ? '#004c99' : '#cfe2ff'; const pickerItemColorSelected = isDark ? '#ffffff' : '#003d99'; const secondaryButtonColor = '#FFA500'; const pickerDropdownColor = isDark ? '#aaaaaa' : '#888888'; const infoTextColor = isDark ? '#aaaaaa' : '#6c757d'; const errorTextColor = isDark ? '#ff8a80' : '#dc3545'; const dateButtonBorder = isDark ? '#555' : '#ccc'; const dateButtonText = isDark ? '#ccc' : '#555';

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor }, contentContainer: { padding: 15, paddingBottom: 40 }, // Ajustado padding
        titulo: { fontSize: 20, marginBottom: 15, fontWeight: 'bold', color: textColor, textAlign: 'center' },
        labelFiltro: { fontSize: 16, fontWeight: 'bold', color: textColor, marginTop: 15, marginBottom: 8, alignSelf: 'flex-start' }, // Ajustado espaçamento
        input: { borderWidth: 1, borderColor: borderColor, backgroundColor: isDark ? '#2a2a2a' : '#fff', color: textColor, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5, marginBottom: 12, fontSize: 16 }, // Ajustado marginBottom
        pickerContainer: { borderWidth: 1, borderColor: borderColor, borderRadius: 5, marginBottom: 12, backgroundColor: pickerBackgroundColor, justifyContent: 'center' }, // Ajustado marginBottom
        picker: { color: textColor, height: 50 }, pickerItemStyle: { color: textColor, backgroundColor: pickerBackgroundColor, fontSize: 16 }, pickerItemSelectedStyle: { color: pickerItemColorSelected, backgroundColor: pickerItemBgSelected, fontSize: 16, fontWeight: 'bold' }, pickerDropdownColor: pickerDropdownColor,
        dateContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }, // Ajustado marginBottom
        dateButton: { flex: 1, borderWidth: 1, borderColor: dateButtonBorder, borderRadius: 5, paddingVertical: 12, paddingHorizontal: 8, marginHorizontal: 4, alignItems: 'center' }, // Ajustado padding/margin
        dateButtonText: { color: dateButtonText, fontSize: 15 },
        item: { padding: 15, marginVertical: 8, backgroundColor: itemBackgroundColor, borderLeftWidth: 5, borderLeftColor: itemBorderColor, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 2, elevation: 2 },
        tituloProcesso: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: titleColor },
        linha: { fontSize: 15, marginBottom: 4, color: textColor, lineHeight: 22 }, // Ajustado marginBottom
        valor: { color: valueColor, fontWeight: 'normal', fontSize: 15, lineHeight: 22 },
        activityIndicator: { marginVertical: 30 }, buttonContainer: { marginVertical: 8 }, footerButtons: { marginTop: 20, paddingBottom: 30 },
        textoInfo: { fontSize: 16, color: infoTextColor, textAlign: 'center' }, emptyContainer: { alignItems: 'center', marginTop: 50 }, // Estilo para ListEmptyComponent
        errorText: { color: errorTextColor, textAlign: 'center', marginTop: 10, marginBottom: 10, fontSize: 15 }, placeholderTextColor: placeholderTextColor, primaryColor: primaryColor, secondaryButtonColor: secondaryButtonColor,
    });
}