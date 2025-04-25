// --- src/screens/Api.js ---
// Código completo com melhorias: mais dados exibidos e erro mais detalhado

import React, { useState, useMemo, useCallback } from 'react'; // Adicionado useCallback
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert,
    ActivityIndicator, Keyboard, Share
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext'; // Verifique o caminho

// --- Constantes ---
const CNJ_API_BASE_URL = 'https://api-publica.datajud.cnj.jus.br';
// Chave pública oficial da Wiki do CNJ (em 22/04/2025) [cite: 1]
const CNJ_API_KEY = "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";
const ITEMS_PER_PAGE = 10;

export default function Api({ navigation }) {
    // --- States ---
    const [input, setInput] = useState(''); // Input para número do processo
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null); // Para search_after [cite: 36]

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Listas de Tipos e Tribunais (COMPLETA - MANTIDA) ---
    const tiposJustica = [
        { label: 'Tribunais Superiores', value: 'Superior' },
        { label: 'Justiça Federal', value: 'Federal' },
        { label: 'Justiça Estadual', value: 'Estadual' },
        { label: 'Justiça do Trabalho', value: 'Trabalho' },
        { label: 'Justiça Eleitoral', value: 'Eleitoral' },
        { label: 'Justiça Militar', value: 'Militar' }
    ];

    // <<< SUA LISTA EXTENSA DE TRIBUNAIS FOI MANTIDA INTEGRALMENTE >>>
    const tribunais = [
        { nome: 'Selecione um tribunal', url: '', tipo: '' },
        // Tribunais Superiores
        { nome: 'Tribunal Superior do Trabalho - TST', url: 'api_publica_tst', tipo: 'Superior' }, // [cite: 10]
        { nome: 'Tribunal Superior Eleitoral - TSE', url: 'api_publica_tse', tipo: 'Superior' }, // [cite: 10]
        { nome: 'Tribunal Superior de Justiça - STJ', url: 'api_publica_stj', tipo: 'Superior' }, // [cite: 10]
        { nome: 'Tribunal Superior Militar - TSM', url: 'api_publica_stm', tipo: 'Superior' }, // [cite: 10]
        // Justiça Federal
        { nome: 'Tribunal Regional Federal da 1ª Região - TRF1', url: 'api_publica_trf1', tipo: 'Federal' }, // [cite: 11]
        { nome: 'Tribunal Regional Federal da 2ª Região - TRF2', url: 'api_publica_trf2', tipo: 'Federal' }, // [cite: 11]
        { nome: 'Tribunal Regional Federal da 3ª Região - TRF3', url: 'api_publica_trf3', tipo: 'Federal' }, // [cite: 11]
        { nome: 'Tribunal Regional Federal da 4ª Região - TRF4', url: 'api_publica_trf4', tipo: 'Federal' }, // [cite: 11]
        { nome: 'Tribunal Regional Federal da 5ª Região - TRF5', url: 'api_publica_trf5', tipo: 'Federal' }, // [cite: 11]
        { nome: 'Tribunal Regional Federal da 6ª Região - TRF6', url: 'api_publica_trf6', tipo: 'Federal' }, // [cite: 11]
        // Justiça Estadual
        { nome: 'Tribunal de Justiça do Acre - TJ-AC', url: 'api_publica_tjac', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Alagoas - TJ-AL', url: 'api_publica_tjal', tipo: 'Estadual' }, // [cite: 12, 56]
        { nome: 'Tribunal de Justiça do Amapá - TJ-AP', url: 'api_publica_tjap', tipo: 'Estadual' }, // [cite: 12]
        // Correção: O doc tinha TJAM aqui, mas o texto era TJ Manaus. Mantendo TJAM.
        { nome: 'Tribunal de Justiça do Amazonas - TJ-AM', url: 'api_publica_tjam', tipo: 'Estadual' }, // [cite: 12, 56]
        { nome: 'Tribunal de Justiça da Bahia - TJ-BA', url: 'api_publica_tjba', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Ceará - TJ-CE', url: 'api_publica_tjce', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Distrito Federal - TJ-DF', url: 'api_publica_tjdft', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Espírito Santo - TJ-ES', url: 'api_publica_tjes', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Goiás - TJ-GO', url: 'api_publica_tjgo', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Maranhão - TJ-MA', url: 'api_publica_tjma', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Minas Gerais - TJ-MG', url: 'api_publica_tjmg', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Mato Grosso do Sul - TJ-MS', url: 'api_publica_tjms', tipo: 'Estadual' }, // [cite: 12, 57]
        { nome: 'Tribunal de Justiça do Mato Grosso - TJ-MT', url: 'api_publica_tjmt', tipo: 'Estadual' }, // [cite: 12, 57]
        { nome: 'Tribunal de Justiça do Pará - TJ-PA', url: 'api_publica_tjpa', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça da Paraíba - TJ-PB', url: 'api_publica_tjpb', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Paraná - TJ-PR', url: 'api_publica_tjpr', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Pernambuco - TJ-PE', url: 'api_publica_tjpe', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Piauí - TJ-PI', url: 'api_publica_tjpi', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Rio de Janeiro - TJ-RJ', url: 'api_publica_tjrj', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Rio Grande do Norte - TJ-RN', url: 'api_publica_tjrn', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça do Rio Grande do Sul - TJ-RS', url: 'api_publica_tjrs', tipo: 'Estadual' }, // [cite: 12, 58]
        { nome: 'Tribunal de Justiça de Rondônia - TJ-RO', url: 'api_publica_tjro', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Roraima - TJ-RR', url: 'api_publica_tjrr', tipo: 'Estadual' }, // [cite: 12]
        { nome: 'Tribunal de Justiça de Santa Catarina - TJ-SC', url: 'api_publica_tjsc', tipo: 'Estadual' }, // [cite: 12, 58]
        { nome: 'Tribunal de Justiça de São Paulo TJ-SP', url: 'api_publica_tjsp', tipo: 'Estadual' }, // [cite: 12, 58]
        { nome: 'Tribunal de Justiça de Sergipe -TJ-SE', url: 'api_publica_tjse', tipo: 'Estadual' }, // [cite: 12, 58]
        { nome: 'Tribunal de Justiça do Tocantins - TJ-TO', url: 'api_publica_tjto', tipo: 'Estadual' }, // [cite: 12, 58]
        // Justiça do Trabalho
        { nome: 'Tribunal Regional do Trabalho da 1ª Região - TRT1', url: 'api_publica_trt1', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 2ª Região - TRT2', url: 'api_publica_trt2', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 3ª Região - TRT3', url: 'api_publica_trt3', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 4ª Região - TRT4', url: 'api_publica_trt4', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 5ª Região - TRT5', url: 'api_publica_trt5', tipo: 'Trabalho' }, // [cite: 13, 59]
        { nome: 'Tribunal Regional do Trabalho da 6ª Região - TRT6', url: 'api_publica_trt6', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 7ª Região - TRT7', url: 'api_publica_trt7', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 8ª Região - TRT8', url: 'api_publica_trt8', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 9ª Região - TRT9', url: 'api_publica_trt9', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 10ª Região - TRT10', url: 'api_publica_trt10', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 11ª Região - TRT11', url: 'api_publica_trt11', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 12ª Região - TRT12', url: 'api_publica_trt12', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 13ª Região - TRT13', url: 'api_publica_trt13', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 14ª Região - TRT14', url: 'api_publica_trt14', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 15ª Região - TRT15', url: 'api_publica_trt15', tipo: 'Trabalho' }, // [cite: 13, 60]
        // Correção: TRT16 estava com URL do TRT15 no doc[cite: 13]. Assumindo URL correta.
        { nome: 'Tribunal Regional do Trabalho da 16ª Região - TRT16', url: 'api_publica_trt16', tipo: 'Trabalho' }, // [cite: 13, 60]
        { nome: 'Tribunal Regional do Trabalho da 17ª Região - TRT17', url: 'api_publica_trt17', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 18ª Região - TRT18', url: 'api_publica_trt18', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 19ª Região - TRT19', url: 'api_publica_trt19', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 20ª Região - TRT20', url: 'api_publica_trt20', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 21ª Região - TRT21', url: 'api_publica_trt21', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 22ª Região - TRT22', url: 'api_publica_trt22', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 23ª Região - TRT23', url: 'api_publica_trt23', tipo: 'Trabalho' }, // [cite: 13]
        { nome: 'Tribunal Regional do Trabalho da 24ª Região - TRT24', url: 'api_publica_trt24', tipo: 'Trabalho' }, // [cite: 13, 61]
        // Justiça Eleitoral - Note: Os aliases no doc [cite: 14] parecem usar só a sigla do estado, mas a lista completa [cite: 61, 62, 63] usa 'tre-uf'. Usarei o formato 'tre-uf'.
        { nome: 'Tribunal Regional Eleitoral do Acre - TRE-AC', url: 'api_publica_tre-ac', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral de Alagoas - TRE-AL', url: 'api_publica_tre-al', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Amapá - TRE-AP', url: 'api_publica_tre-ap', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Amazonas - TRE-AM', url: 'api_publica_tre-am', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral da Bahia - TRE-BA', url: 'api_publica_tre-ba', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Ceará - TRE-CE', url: 'api_publica_tre-ce', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Distrito Federal - TRE-DF', url: 'api_publica_tre-df', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Espírito Santo - TRE-ES', url: 'api_publica_tre-es', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral de Goiás - TRE-GO', url: 'api_publica_tre-go', tipo: 'Eleitoral' }, // [cite: 61]
        { nome: 'Tribunal Regional Eleitoral do Maranhão - TRE-MA', url: 'api_publica_tre-ma', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral de Minas Gerais - TRE-MG', url: 'api_publica_tre-mg', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso do Sul - TRE-MS', url: 'api_publica_tre-ms', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso - TRE-MT', url: 'api_publica_tre-mt', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Pará - TRE-PA', url: 'api_publica_tre-pa', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral da Paraíba - TRE-PB', url: 'api_publica_tre-pb', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Paraná - TRE-PR', url: 'api_publica_tre-pr', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral de Pernambuco - TRE-PE', url: 'api_publica_tre-pe', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Piauí - TRE-PI', url: 'api_publica_tre-pi', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Rio de Janeiro - TRE-RJ', url: 'api_publica_tre-rj', tipo: 'Eleitoral' }, // [cite: 62]
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Norte - TRE-RN', url: 'api_publica_tre-rn', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul - TRE-RS', url: 'api_publica_tre-rs', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral de Rondônia - TRE-RO', url: 'api_publica_tre-ro', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral de Roraima - TRE-RR', url: 'api_publica_tre-rr', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral de Santa Catarina - TRE-SC', url: 'api_publica_tre-sc', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral de São Paulo - TRE-SP', url: 'api_publica_tre-sp', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral de Sergipe - TRE-SE', url: 'api_publica_tre-se', tipo: 'Eleitoral' }, // [cite: 63]
        { nome: 'Tribunal Regional Eleitoral do Tocantins - TRE-TO', url: 'api_publica_tre-to', tipo: 'Eleitoral' }, // [cite: 63]
        // Justiça Militar
        { nome: 'Tribunal de Justiça Militar de Minas Gerais -TJM-MG', url: 'api_publica_tjmmg', tipo: 'Militar' }, // [cite: 15, 64]
        { nome: 'Tribunal de Justiça Militar do Rio Grande do Sul - TJM-RS', url: 'api_publica_tjmrs', tipo: 'Militar' }, // [cite: 15, 64]
        { nome: 'Tribunal de Justiça Militar de São Paulo - TJM-SP', url: 'api_publica_tjmsp', tipo: 'Militar' }, // [cite: 15, 64]
    ];

    // --- Funções Auxiliares ---
    // useCallback para evitar recriação desnecessária das funções
    const limparTela = useCallback(() => {
        setInput('');
        setDados([]);
        setTribunalSelecionado('');
        setTipoJusticaSelecionado('');
        setTribunaisFiltrados([]);
        setUltimaPaginacao(null);
        Keyboard.dismiss();
    }, []); // Sem dependências, pois só usa setters de state

    const formatarData = useCallback((dataStr) => { // useCallback aqui também
        if (!dataStr) return "Não informada";
        try {
            const date = new Date(dataStr);
            // Verifica se é uma data válida antes de formatar
            if (isNaN(date.getTime())) return dataStr; // Retorna original se inválida

            // Tenta detectar se tem hora para formatar diferente
            if (dataStr.includes('T') || dataStr.includes(':')) { // Checa T ou : para indicar hora
                return date.toLocaleString('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' });
            } else {
                return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }
        } catch (e) {
            console.error("Erro ao formatar data:", dataStr, e); // Loga o erro
            return dataStr; // Retorna original em caso de erro
        }
    }, []); // Sem dependências

    // --- Função Principal de Busca (por Número) ---
    const buscarDados = useCallback(async (paginando = false) => { // useCallback aqui
        const numeroLimpo = input.trim().replace(/[^0-9]/g, ''); // Limpa e usa
        Keyboard.dismiss();
        if (!numeroLimpo) { Alert.alert("Erro", "Digite o número do processo (apenas números)."); return; }
        if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; }
        // Adicionando validação de 20 dígitos
        if (numeroLimpo.length !== 20) {
            Alert.alert("Erro de Formato", "O número do processo deve conter exatamente 20 dígitos (padrão CNJ).");
            return;
        }

        setCarregando(true);
        if (!paginando) {
            setDados([]);
            setUltimaPaginacao(null);
        }

        try {
            const url = `${CNJ_API_BASE_URL}/${tribunalSelecionado}/_search`; // [cite: 7, 79]
            let query = {
                size: ITEMS_PER_PAGE,
                query: { match: { numeroProcesso: numeroLimpo } }, // [cite: 19]
                // Ordenação necessária para paginação search_after [cite: 41, 45]
                sort: [{ "@timestamp": { order: "asc" } }]
            };

            // Adiciona paginação se for o caso [cite: 36, 46]
            if (paginando && ultimaPaginacao) {
                query.search_after = ultimaPaginacao;
            }

            console.log(`Buscando Dados - URL: ${url} - Paginando: ${paginando}`);
            // console.log("Query:", JSON.stringify(query)); // Descomente para debug detalhado

            const resposta = await axios.post(url, query, {
                headers: {
                    // Usa a APIKey conforme documentação da Wiki [cite: 1, 78]
                    Authorization: CNJ_API_KEY,
                    'Content-Type': 'application/json' // [cite: 23, 30]
                },
                timeout: 30000 // 30 segundos
            });

            console.log("Resposta API:", resposta.status);

            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                // Adiciona ou substitui os dados no estado
                setDados(prev => paginando ? [...prev, ...novosDados] : novosDados);
                // Guarda o valor 'sort' do último item para a próxima página [cite: 42, 43, 44]
                const ultimo = novosDados[novosDados.length - 1];
                setUltimaPaginacao(ultimo?.sort || null); // Define null se não houver mais páginas
            } else {
                if (!paginando) {
                    setDados([]); // Garante que a lista está vazia se não encontrar nada
                    Alert.alert("Não Encontrado", "Nenhuma informação encontrada para este processo neste tribunal.");
                } else {
                    // Informa que não há mais páginas para carregar
                    Alert.alert("Fim dos Resultados", "Não há mais informações para carregar.");
                }
                setUltimaPaginacao(null); // Reseta paginação ao não encontrar mais dados
            }
        } catch (erro) {
            console.error("Erro na busca de dados:", erro); // Log completo do erro
            setDados([]); // Limpa dados em caso de erro
            setUltimaPaginacao(null); // Reseta paginação

            let errorMsg = "Falha na busca.";
            let errorDetail = "";
            if (erro.response) {
                // Tenta extrair uma mensagem mais útil do erro da API
                errorDetail = JSON.stringify(erro.response.data?.error || erro.response.data || '');
                errorMsg += `\nStatus ${erro.response.status}. Detalhes: ${errorDetail}`;
                console.error("Erro API Response:", erro.response.status, erro.response.data);
                // Tratamento específico para erros comuns
                if (erro.response.status === 401) {
                    errorMsg = "Erro de Autenticação: Verifique a API Key.";
                } else if (erro.response.status === 404) {
                    errorMsg = `Erro: Recurso não encontrado (Verifique o tribunal selecionado: ${tribunalSelecionado}).`;
                } else if (erro.response.status >= 500) {
                    errorMsg = "Erro no servidor do CNJ. Tente novamente mais tarde.";
                }
            } else if (erro.request) {
                errorMsg = "Sem resposta do servidor (Timeout ou problema de rede). Verifique sua conexão.";
                console.error("Erro Req:", erro.request);
            } else {
                errorMsg = `Erro inesperado: ${erro.message}`;
                console.error("Erro Geral:", erro.message);
            }
            Alert.alert("Erro na Busca", errorMsg);
            console.error("Objeto erro completo:", erro);
        } finally {
            setCarregando(false);
        }
        // Dependências do useCallback: input e tribunalSelecionado disparam nova busca
        // ultimaPaginacao não precisa ser dependência direta da busca inicial
    }, [input, tribunalSelecionado, ultimaPaginacao]); // Adicionado ultimaPaginacao como dep para paginação

    // --- Função de Compartilhar (DETALHADA - Mantida como estava) ---
    const onShare = useCallback(async () => { // useCallback aqui
        if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para compartilhar."); return; }
        try {
            let message = `Consulta Processual (Número: ${input}):\n`;
            dados.forEach((item, index) => {
                const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                const numeroProcesso = d.numeroProcesso || 'N/D'; const tribunal = d.tribunal || 'N/D'; const grau = d.grau || 'N/D';
                const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', /*...*/ 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'N/I';
                const classeCodigo = d.classe?.codigo; const classeNome = d.classe?.nome || 'N/D';
                const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D'; const orgaoCodigo = d.orgaoJulgador?.codigo;
                const dataAjuizamento = formatarData(d.dataAjuizamento);
                const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                const custas = dadosBasicos.custasRecolhidas;
                const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
                const juizo100 = dadosBasicos.juizo100Digital;
                const formato = d.formato?.nome; const sistema = d.sistema?.nome; // Pega formato e sistema

                const assuntosTexto = (Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || '?'} (${a.codigo || '?'})`).join(' | ') : 'N/I');
                const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []); const partesFormatadas = Array.isArray(partesArray) ? partesArray.slice(0, 5).map(pt => `(${pt.polo?.sigla || '?'}) ${pt.nome || pt.pessoa?.nome || '?'}`).join('\n') + (partesArray.length > 5 ? '\n...' : '') : 'N/I'; // Simplificado para Share
                const movimentosArray = d.movimentos || d.movimento; const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 5).map(m => `[${m.codigo || '?'}] ${formatarData(m.dataHora)}: ${m.nome || m.movimentoNacional?.descricao || '?'}`).join('\n') + (movimentosArray.length > 5 ? '\n...' : '') : 'Nenhuma.'; // Simplificado

                message += `\n--- Processo ${index + 1} ---\n`;
                message += `Número: ${numeroProcesso}\n`;
                message += `Tribunal: ${tribunal} | Grau: ${grau} | Sigilo: ${nivelSigiloTexto}\n`;
                if(formato) message += `Formato: ${formato} | `; // Adiciona formato
                if(sistema) message += `Sistema: ${sistema}\n`; else message += "\n"; // Adiciona sistema
                message += `Classe: ${classeCodigo ? `(${classeCodigo}) ` : ''}${classeNome}\n`;
                message += `Órgão Julgador: ${orgaoTexto} ${orgaoCodigo ? `(${orgaoCodigo})` : ''}\n`;
                message += `Ajuizamento: ${dataAjuizamento}\n`;
                message += `Valor Causa: ${valorCausaTexto}\n`;
                if (custas !== undefined && custas !== null) message += `Custas Recolhidas: ${custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
                if (prioridades) message += `Prioridade(s): ${prioridades}\n`;
                if (juizo100 === true || juizo100 === false) message += `Juízo 100% Digital: ${juizo100 ? 'Sim' : 'Não'}\n`;
                message += `\nAssunto(s): ${assuntosTexto}\n`;
                message += `\nPartes (Resumo):\n${partesFormatadas}\n`;
                message += `\nMovimentações (Resumo):\n${movimentacoes}\n`;
                message += `--------------------\n`;
            });

            if(message.endsWith('--------------------\n')) { message = message.substring(0, message.length - '--------------------\n'.length); }
            await Share.share({ message });

        } catch (error) {
            Alert.alert("Erro", `Falha ao preparar dados para compartilhar: ${error.message}`);
            console.error("Erro ao compartilhar:", error);
        }
        // Dependências do useCallback: input, dados, formatarData
    }, [input, dados, formatarData]);

    // --- Determina se pode carregar mais ---
    const podeCarregarMais = () => { return !carregando && !!ultimaPaginacao; };


    // --- Renderização ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={ // Cabeçalho da Lista: Pickers e Input
                    <View>
                        <Text style={styles.titulo}>Busca por Número de Processo (CNJ)</Text>

                        {/* Pickers (mantidos como estavam) */}
                        <View style={styles.pickerContainer}>
                            <Picker /* ... Tipo Justiça ... */
                                selectedValue={tipoJusticaSelecionado}
                                onValueChange={(itemValue) => {
                                    setTipoJusticaSelecionado(itemValue);
                                    const filtrados = tribunais.filter(t => t.tipo === itemValue || t.url === '');
                                    setTribunaisFiltrados(filtrados);
                                    setTribunalSelecionado(''); setDados([]); setUltimaPaginacao(null);
                                }}
                                style={styles.picker} dropdownIconColor={styles.pickerDropdownColor} >
                                <Picker.Item label="1. Selecione o Tipo de Justiça" value="" style={styles.pickerItemStyle} />
                                {tiposJustica.map((tipo, i) => ( <Picker.Item key={`${tipo.value}-${i}`} label={tipo.label} value={tipo.value} style={tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                            </Picker>
                        </View>
                        {tipoJusticaSelecionado !== '' && (
                            <View style={styles.pickerContainer}>
                                <Picker /* ... Tribunal ... */
                                    selectedValue={tribunalSelecionado}
                                    onValueChange={(itemValue) => { setTribunalSelecionado(itemValue); if (itemValue !== tribunalSelecionado) { setDados([]); setUltimaPaginacao(null); } }}
                                    style={styles.picker} enabled={tribunaisFiltrados.length > 1} dropdownIconColor={styles.pickerDropdownColor} >
                                    {tribunaisFiltrados.map((tribunal, i) => ( <Picker.Item key={`${tribunal.url}-${i}-${tribunal.nome}`} label={tribunal.url === '' ? '2. Selecione o Tribunal' : tribunal.nome} value={tribunal.url} style={tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                                </Picker>
                            </View>
                        )}

                        {/* Input Número Processo */}
                        <TextInput
                            style={styles.input}
                            placeholder="Digite os 20 dígitos do Nº CNJ" // Placeholder mais específico
                            placeholderTextColor={styles.placeholderTextColor}
                            value={input}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9]/g, ''); // Permite apenas números
                                setInput(numericText);
                            }}
                            keyboardType={'numeric'} // Teclado numérico
                            maxLength={20} // Limita a 20 dígitos
                            onSubmitEditing={() => buscarDados(false)}
                            returnKeyType="search"
                            editable={!carregando}
                        />

                        {/* Botões Buscar e Nova Pesquisa */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Buscar"
                                onPress={() => buscarDados(false)}
                                // Habilita apenas com tribunal e input com 7+ digitos (ajustar para 20 se preferir validação mais estrita)
                                disabled={carregando || !tribunalSelecionado || !input.trim() || input.trim().length < 7 }
                                color={styles.primaryColor}
                            />
                        </View>
                        {dados.length > 0 && !carregando && (
                            <View style={styles.buttonContainer}>
                                <Button title="Nova Pesquisa" onPress={limparTela} color={styles.secondaryButtonColor} />
                            </View>
                        )}
                        {/* Indicador de Loading */}
                        {carregando && ( <ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} /> )}
                    </View>
                }
                // --- Renderização dos Itens da Lista ---
                data={dados}
                keyExtractor={(item, index) => item._id || index.toString()} // _id vem do Elasticsearch
                renderItem={({ item }) => { // Renderiza cada processo encontrado
                    const d = item._source || {}; // Dados principais estão em _source [cite: 42]
                    const dadosBasicos = d.dadosBasicos || {}; // Alguns dados podem estar aqui dentro

                    // Extrai dados com fallback para N/D ou N/I
                    const numeroProcesso = d.numeroProcesso || 'N/D';
                    const tribunal = d.tribunal || 'N/D';
                    const grau = d.grau || 'N/D';
                    const sigiloMap = { 0: 'Público', 1: 'Segredo Nível 1', 2: 'Segredo Nível 2', 3: 'Segredo Nível 3', 4: 'Segredo Nível 4', 5: 'Segredo Nível 5' }; // Mapeamento de sigilo
                    const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';
                    const classeCodigo = d.classe?.codigo;
                    const classeNome = d.classe?.nome || 'N/D';
                    const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
                    const orgaoCodigo = d.orgaoJulgador?.codigo;
                    const dataAjuizamento = formatarData(d.dataAjuizamento);
                    const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa;
                    const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                    const custas = dadosBasicos.custasRecolhidas; // Vem de dadosBasicos? Verificar API real.
                    const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || ''); // Vem de dadosBasicos?
                    const juizo100 = dadosBasicos.juizo100Digital; // Vem de dadosBasicos?

                    // <<< MELHORIA: Pega formato e sistema >>>
                    const formatoProcesso = d.formato?.nome || 'N/I'; // [cite: 53]
                    const sistemaProcessual = d.sistema?.nome || 'N/I'; // [cite: 53]

                    // Formata Assuntos (como já fazia)
                    const assuntosTexto = Array.isArray(d.assuntos) && d.assuntos.length > 0
                        ? d.assuntos.map(a => `${a.nome || '?'} (${a.codigo || '?'})`).join(' | ')
                        : 'Não informado';

                    // Formata Partes (como já fazia, talvez simplificar/melhorar)
                    const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []);
                    const partesFormatadas = Array.isArray(partesArray)
                        ? partesArray.map((pt) => {
                            const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida';
                            const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?';
                            const advogadosArray = pt.advogados || pt.advogado;
                            const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0
                                ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB?'})`).join('; ')
                                : '';
                            return `(${polo}) ${nome}${advogadosFormatados}`;
                        }).join('\n\n')
                        : 'Partes não informadas';

                    // Formata Movimentos (como já fazia, limitando a 15)
                    const movimentosArray = d.movimentos || d.movimento;
                    const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0
                        ? movimentosArray.slice(0, 15).map((m) => {
                        const data = formatarData(m.dataHora);
                        const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A';
                        const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito';
                        let complementosStr = '';
                        if (Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0) {
                            complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; ');
                            complementosStr = `\n     -> Comp. Tabelado: ${complementosStr}`;
                        }
                        const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || '');
                        const complementoTextoFormatado = complementoTexto ? `\n     -> Comp. Texto: ${complementoTexto}` : '';
                        return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`;
                    }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '')
                        : 'Sem movimentações registradas.';


                    // Renderiza o Card do Processo
                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso} selectable={true}>📄 Processo: <Text style={styles.valor}>{numeroProcesso}</Text></Text>
                            <Text style={styles.linha} selectable={true}>🏛️ Tribunal: <Text style={styles.valor}>{tribunal}</Text> | Grau: <Text style={styles.valor}>{grau}</Text> | Sigilo: <Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>

                            {/* <<< MELHORIA: Mostra Sistema e Formato >>> */}
                            <Text style={styles.linha} selectable={true}>
                                {sistemaProcessual !== 'N/I' && <><Text>⚙️ Sistema: </Text><Text style={styles.valor}>{sistemaProcessual}</Text></>}
                                {sistemaProcessual !== 'N/I' && formatoProcesso !== 'N/I' && <Text> | </Text>}
                                {formatoProcesso !== 'N/I' && <><Text>Formato: </Text><Text style={styles.valor}>{formatoProcesso}</Text></>}
                            </Text>

                            <Text style={styles.linha} selectable={true}>🏷️ Classe: <Text style={styles.valor}>{classeCodigo ? `(${classeCodigo}) ` : ''}{classeNome}</Text></Text>
                            <Text style={styles.linha} selectable={true}>📍 Órgão Julgador: <Text style={styles.valor}>{orgaoTexto} {orgaoCodigo ? `(${orgaoCodigo})` : ''}</Text></Text>
                            <Text style={styles.linha} selectable={true}>📅 Ajuizamento: <Text style={styles.valor}>{dataAjuizamento}</Text></Text>
                            <Text style={styles.linha} selectable={true}>💰 Valor Causa: <Text style={styles.valor}>{valorCausaTexto}</Text></Text>
                            {(custas !== undefined && custas !== null) && <Text style={styles.linha} selectable={true}>💲 Custas Recolhidas: <Text style={styles.valor}>{custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text> }
                            {prioridades && <Text style={styles.linha} selectable={true}>🚩 Prioridade(s): <Text style={styles.valor}>{prioridades}</Text></Text> }
                            {(juizo100 === true || juizo100 === false) && <Text style={styles.linha} selectable={true}>💻 Juízo 100% Digital: <Text style={styles.valor}>{juizo100 ? 'Sim' : 'Não'}</Text></Text> }
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes:</Text><Text style={styles.valor} selectable={true}>{partesFormatadas}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Últimas 15):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
                        </View>
                    );
                }}
                // --- Rodapé da Lista: Botões de Paginação e Share ---
                ListFooterComponent={
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {/* Botão Carregar Mais (Paginação) */}
                            {podeCarregarMais() && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Carregar mais resultados" onPress={() => buscarDados(true)} disabled={carregando} color={styles.primaryColor} />
                                </View>
                            )}
                            {/* Botão Compartilhar */}
                            {dados.length > 0 && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Compartilhar Resultados" onPress={onShare} color={styles.primaryColor} />
                                </View>
                            )}
                        </View>
                    ) : null
                }
                // --- Mensagem para Lista Vazia ---
                ListEmptyComponent={
                    !carregando && input.trim() && tribunalSelecionado ? (
                        <View style={{alignItems: 'center', marginTop: 50}}>
                            <Text style={styles.textoInfo}>Nenhum resultado encontrado para este número de processo neste tribunal.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

// --- Função de Estilos Dinâmicos (Mantida como estava) ---
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
    const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff';
    const pickerItemBgSelected = isDark ? '#004c99' : '#cfe2ff';
    const pickerItemColorSelected = isDark ? '#ffffff' : '#003d99';
    const secondaryButtonColor = '#FFA500';
    const pickerDropdownColor = isDark ? '#aaaaaa' : '#888888';
    const infoTextColor = isDark ? '#aaaaaa' : '#6c757d';

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor },
        contentContainer: { padding: 20, paddingBottom: 40 },
        titulo: { fontSize: 20, marginBottom: 15, fontWeight: 'bold', color: textColor, textAlign: 'center' },
        input: { borderWidth: 1, borderColor: borderColor, backgroundColor: isDark ? '#2a2a2a' : '#fff', color: textColor, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5, marginBottom: 15, fontSize: 16 },
        pickerContainer: { borderWidth: 1, borderColor: borderColor, borderRadius: 5, marginBottom: 15, backgroundColor: pickerBackgroundColor, justifyContent: 'center' },
        picker: { color: textColor, height: 50 },
        pickerItemStyle: { color: textColor, backgroundColor: pickerBackgroundColor, fontSize: 16 },
        pickerItemSelectedStyle: { color: pickerItemColorSelected, backgroundColor: pickerItemBgSelected, fontSize: 16, fontWeight: 'bold' },
        pickerDropdownColor: pickerDropdownColor,
        item: { padding: 15, marginVertical: 8, backgroundColor: itemBackgroundColor, borderLeftWidth: 5, borderLeftColor: itemBorderColor, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 2, elevation: 2 },
        tituloProcesso: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: titleColor },
        linha: { fontSize: 15, marginBottom: 3, color: textColor, lineHeight: 22 }, // Aumentei um pouco marginBottom
        valor: { color: valueColor, fontWeight: 'normal', fontSize: 15, lineHeight: 22 },
        activityIndicator: { marginVertical: 30 },
        buttonContainer: { marginVertical: 8 },
        footerButtons: { marginTop: 20, paddingBottom: 30 },
        textoInfo: { fontSize: 16, color: infoTextColor, textAlign: 'center' },
        placeholderTextColor: placeholderTextColor,
        primaryColor: primaryColor,
        secondaryButtonColor: secondaryButtonColor,
    });
}