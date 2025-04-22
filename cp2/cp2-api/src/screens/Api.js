// --- src/screens/Api.js ---
// Código completo com compartilhamento detalhado e demais correções

import React, { useState, useMemo } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert,
    ActivityIndicator, Keyboard, Share // Importa Share
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext'; // Verifique o caminho

export default function Api({ navigation }) {
    // --- States ---
    const [input, setInput] = useState(''); // Input para número do processo
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Listas de Tipos e Tribunais (COMPLETA) ---
    const tiposJustica = [
        { label: 'Tribunais Superiores', value: 'Superior' },
        { label: 'Justiça Federal', value: 'Federal' },
        { label: 'Justiça Estadual', value: 'Estadual' },
        { label: 'Justiça do Trabalho', value: 'Trabalho' },
        { label: 'Justiça Eleitoral', value: 'Eleitoral' },
        { label: 'Justiça Militar', value: 'Militar' }
    ];

    const tribunais = [
        { nome: 'Selecione um tribunal', url: '', tipo: '' },
        // Tribunais Superiores
        { nome: 'Tribunal Superior do Trabalho - TST', url: 'api_publica_tst', tipo: 'Superior' },
        { nome: 'Tribunal Superior Eleitoral - TSE', url: 'api_publica_tse', tipo: 'Superior' },
        { nome: 'Tribunal Superior de Justiça - STJ', url: 'api_publica_stj', tipo: 'Superior' },
        { nome: 'Tribunal Superior Militar - TSM', url: 'api_publica_stm', tipo: 'Superior' },
        // Justiça Federal
        { nome: 'Tribunal Regional Federal da 1ª Região - TRF1', url: 'api_publica_trf1', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 2ª Região - TRF2', url: 'api_publica_trf2', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 3ª Região - TRF3', url: 'api_publica_trf3', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 4ª Região - TRF4', url: 'api_publica_trf4', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 5ª Região - TRF5', url: 'api_publica_trf5', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 6ª Região - TRF6', url: 'api_publica_trf6', tipo: 'Federal' },
        // Justiça Estadual
        { nome: 'Tribunal de Justiça do Acre - TJ-AC', url: 'api_publica_tjac', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Alagoas - TJ-AL', url: 'api_publica_tjal', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Amapá - TJ-AP', url: 'api_publica_tjap', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Amazonas - TJ-AM', url: 'api_publica_tjam', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça da Bahia - TJ-BA', url: 'api_publica_tjba', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Ceará - TJ-CE', url: 'api_publica_tjce', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Distrito Federal - TJ-DF', url: 'api_publica_tjdft', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Espírito Santo - TJ-ES', url: 'api_publica_tjes', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Goiás - TJ-GO', url: 'api_publica_tjgo', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Maranhão - TJ-MA', url: 'api_publica_tjma', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Minas Gerais - TJ-MG', url: 'api_publica_tjmg', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Mato Grosso do Sul - TJ-MS', url: 'api_publica_tjms', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Mato Grosso - TJ-MT', url: 'api_publica_tjmt', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Pará - TJ-PA', url: 'api_publica_tjpa', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça da Paraíba - TJ-PB', url: 'api_publica_tjpb', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Paraná - TJ-PR', url: 'api_publica_tjpr', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Pernambuco - TJ-PE', url: 'api_publica_tjpe', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Piauí - TJ-PI', url: 'api_publica_tjpi', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio de Janeiro - TJ-RJ', url: 'api_publica_tjrj', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio Grande do Norte - TJ-RN', url: 'api_publica_tjrn', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio Grande do Sul - TJ-RS', url: 'api_publica_tjrs', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Rondônia - TJ-RO', url: 'api_publica_tjro', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Roraima - TJ-RR', url: 'api_publica_tjrr', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Santa Catarina - TJ-SC', url: 'api_publica_tjsc', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de São Paulo TJ-SP', url: 'api_publica_tjsp', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Sergipe -TJ-SE', url: 'api_publica_tjse', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Tocantins - TJ-TO', url: 'api_publica_tjto', tipo: 'Estadual' },
        // Justiça do Trabalho
        { nome: 'Tribunal Regional do Trabalho da 1ª Região - TRT1', url: 'api_publica_trt1', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 2ª Região - TRT2', url: 'api_publica_trt2', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 3ª Região - TRT3', url: 'api_publica_trt3', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 4ª Região - TRT4', url: 'api_publica_trt4', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 5ª Região - TRT5', url: 'api_publica_trt5', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 6ª Região - TRT6', url: 'api_publica_trt6', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 7ª Região - TRT7', url: 'api_publica_trt7', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 8ª Região - TRT8', url: 'api_publica_trt8', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 9ª Região - TRT9', url: 'api_publica_trt9', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 10ª Região - TRT10', url: 'api_publica_trt10', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 11ª Região - TRT11', url: 'api_publica_trt11', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 12ª Região - TRT12', url: 'api_publica_trt12', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 13ª Região - TRT13', url: 'api_publica_trt13', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 14ª Região - TRT14', url: 'api_publica_trt14', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 15ª Região - TRT15', url: 'api_publica_trt15', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 16ª Região - TRT16', url: 'api_publica_trt16', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 17ª Região - TRT17', url: 'api_publica_trt17', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 18ª Região - TRT18', url: 'api_publica_trt18', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 19ª Região - TRT19', url: 'api_publica_trt19', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 20ª Região - TRT20', url: 'api_publica_trt20', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 21ª Região - TRT21', url: 'api_publica_trt21', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 22ª Região - TRT22', url: 'api_publica_trt22', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 23ª Região - TRT23', url: 'api_publica_trt23', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 24ª Região - TRT24', url: 'api_publica_trt24', tipo: 'Trabalho' },
        // Justiça Eleitoral
        { nome: 'Tribunal Regional Eleitoral do Acre - TRE-AC', url: 'api_publica_tre-ac', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Alagoas - TRE-AL', url: 'api_publica_tre-al', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Amapá - TRE-AP', url: 'api_publica_tre-ap', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Amazonas - TRE-AM', url: 'api_publica_tre-am', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral da Bahia - TRE-BA', url: 'api_publica_tre-ba', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Ceará - TRE-CE', url: 'api_publica_tre-ce', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Distrito Federal - TRE-DF', url: 'api_publica_tre-df', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Espírito Santo - TRE-ES', url: 'api_publica_tre-es', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Goiás - TRE-GO', url: 'api_publica_tre-go', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Maranhão - TRE-MA', url: 'api_publica_tre-ma', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Minas Gerais - TRE-MG', url: 'api_publica_tre-mg', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso do Sul - TRE-MS', url: 'api_publica_tre-ms', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso - TRE-MT', url: 'api_publica_tre-mt', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Pará - TRE-PA', url: 'api_publica_tre-pa', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral da Paraíba - TRE-PB', url: 'api_publica_tre-pb', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Paraná - TRE-PR', url: 'api_publica_tre-pr', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Pernambuco - TRE-PE', url: 'api_publica_tre-pe', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Piauí - TRE-PI', url: 'api_publica_tre-pi', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio de Janeiro - TRE-RJ', url: 'api_publica_tre-rj', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Norte - TRE-RN', url: 'api_publica_tre-rn', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul - TRE-RS', url: 'api_publica_tre-rs', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Rondônia - TRE-RO', url: 'api_publica_tre-ro', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Roraima - TRE-RR', url: 'api_publica_tre-rr', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Santa Catarina - TRE-SC', url: 'api_publica_tre-sc', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de São Paulo - TRE-SP', url: 'api_publica_tre-sp', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Sergipe - TRE-SE', url: 'api_publica_tre-se', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Tocantins - TRE-TO', url: 'api_publica_tre-to', tipo: 'Eleitoral' },
        // Justiça Militar
        { nome: 'Tribunal de Justiça Militar de Minas Gerais -TJM-MG', url: 'api_publica_tjmmg', tipo: 'Militar' },
        { nome: 'Tribunal de Justiça Militar do Rio Grande do Sul - TJM-RS', url: 'api_publica_tjmrs', tipo: 'Militar' },
        { nome: 'Tribunal de Justiça Militar de São Paulo - TJM-SP', url: 'api_publica_tjmsp', tipo: 'Militar' },
    ];

    // --- Funções Auxiliares ---
    const limparTela = () => {
        setInput('');
        setDados([]);
        setTribunalSelecionado('');
        setTipoJusticaSelecionado('');
        setTribunaisFiltrados([]);
        setUltimaPaginacao(null);
        Keyboard.dismiss();
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return "Não informada";
        try {
            const date = new Date(dataStr);
            if (isNaN(date.getTime())) return dataStr;
            return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch {
            return dataStr;
        }
    };

    // --- Função Principal de Busca (por Número) ---
    const buscarDados = async (paginando = false) => {
        Keyboard.dismiss();
        if (!input.trim()) { Alert.alert("Erro", "Digite o número do processo."); return; }
        if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; }
        setCarregando(true);
        if (!paginando) {
            setDados([]);
            setUltimaPaginacao(null);
        }

        try {
            const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`;
            let query = {
                size: 10,
                query: { match: { numeroProcesso: input.trim() } },
                sort: [{ "@timestamp": { order: "asc" } }]
            };

            if (paginando && ultimaPaginacao) {
                query.search_after = ultimaPaginacao;
            }

            const resposta = await axios.post(url, query, {
                headers: {
                    Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==", // Sua chave API
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                setDados(prev => paginando ? [...prev, ...novosDados] : [...novosDados]);
                const ultimo = novosDados[novosDados.length - 1];
                if (ultimo?.sort) {
                    setUltimaPaginacao(ultimo.sort);
                } else {
                    setUltimaPaginacao(null);
                }
            } else {
                if (!paginando) {
                    setDados([]);
                    Alert.alert("Nada encontrado", "Nenhuma informação para este processo neste tribunal.");
                } else {
                    Alert.alert("Fim dos resultados", "Não há mais informações para carregar.");
                }
                setUltimaPaginacao(null);
            }
        } catch (erro) {
            setDados([]);
            setUltimaPaginacao(null);
            let errorMsg = "Falha na busca.";
            if (erro.response) { console.error("Erro API:", erro.response.status, erro.response.data); errorMsg += `\nStatus: ${erro.response.status}. Verifique o console.`; }
            else if (erro.request) { console.error("Erro Req:", erro.request); errorMsg += "\nSem resposta do servidor ou timeout."; }
            else { console.error("Erro:", erro.message); errorMsg += `\n${erro.message}`; }
            Alert.alert("Erro", errorMsg);
            console.error("Objeto erro completo:", erro);
        } finally {
            setCarregando(false);
        }
    };

    // --- Função de Compartilhar (DETALHADA) ---
    const onShare = async () => {
        if (dados.length === 0) {
            Alert.alert("Sem dados", "Não há resultados para compartilhar.");
            return;
        }
        try {
            let message = `Consulta Processual (Número: ${input}):\n`; // Título inicial

            dados.forEach((item, index) => { // Itera sobre TODOS os dados carregados
                const d = item._source || {};
                const dadosBasicos = d.dadosBasicos || {};

                // --- Reutiliza a lógica de extração/formatação do renderItem ---
                const numeroProcesso = d.numeroProcesso || 'N/D';
                const tribunal = d.tribunal || 'N/D';
                const grau = d.grau || 'N/D';
                const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' };
                const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'N/I';
                const classeCodigo = d.classe?.codigo;
                const classeNome = d.classe?.nome || 'N/D';
                const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
                const orgaoCodigo = d.orgaoJulgador?.codigo;
                const dataAjuizamento = formatarData(d.dataAjuizamento);
                const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa;
                const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                const custas = dadosBasicos.custasRecolhidas;
                const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
                const juizo100 = dadosBasicos.juizo100Digital;

                const assuntosTexto = (Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'N/I'));

                const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []);
                const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || ''; const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || ''; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? ` | Adv: ${advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ')}` : ''; return `(${polo || 'N/I'}) ${nome}${advogadosFormatados}`; }).join('\n') : 'N/I';

                const movimentosArray = d.movimentos || d.movimento;
                const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = ` -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? ` -> ${complementoTexto}` : ''; return `[${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Nenhuma.';
                // --- Fim da Extração/Formatação ---

                // --- Constrói a mensagem para este processo ---
                message += `\n--- Processo ${index + 1} ---\n`;
                message += `Número: ${numeroProcesso}\n`;
                message += `Tribunal: ${tribunal} | Grau: ${grau} | Sigilo: ${nivelSigiloTexto}\n`;
                message += `Classe: ${classeCodigo ? `(${classeCodigo}) ` : ''}${classeNome}\n`;
                message += `Órgão Julgador: ${orgaoTexto} ${orgaoCodigo ? `(${orgaoCodigo})` : ''}\n`;
                message += `Ajuizamento: ${dataAjuizamento}\n`;
                message += `Valor Causa: ${valorCausaTexto}\n`;
                if (custas !== undefined && custas !== null) message += `Custas Recolhidas: ${custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
                if (prioridades) message += `Prioridade(s): ${prioridades}\n`;
                if (juizo100 === true || juizo100 === false) message += `Juízo 100% Digital: ${juizo100 ? 'Sim' : 'Não'}\n`;
                message += `\nAssunto(s):\n${assuntosTexto}\n`;
                message += `\nPartes:\n${partesFormatadas}\n`;
                message += `\nMovimentações (Últimas 15):\n${movimentacoes}\n`;
                message += `--------------------\n`;
            });

            // Remove o último separador e adiciona nota sobre limite (se houver)
            if(message.endsWith('--------------------\n')) {
                message = message.substring(0, message.length - '--------------------\n'.length);
            }
            if (dados.some(item => (item._source?.movimentos || item._source?.movimento)?.length > 15)) {
                message += "\n(Lista de movimentos limitada aos 15 mais recentes por processo)";
            }

            // Chama a API Share
            await Share.share({ message });

        } catch (error) {
            Alert.alert("Erro", `Falha ao preparar dados para compartilhar: ${error.message}`);
            console.error("Erro ao compartilhar:", error);
        }
    };
    // --- Fim da Função de Compartilhar ---


    // --- Renderização ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        <Text style={styles.titulo}>Busca por Número de Processo</Text>

                        {/* Pickers com estilo condicional */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tipoJusticaSelecionado}
                                onValueChange={(itemValue) => {
                                    setTipoJusticaSelecionado(itemValue);
                                    const filtrados = tribunais.filter(t => t.tipo === itemValue || t.url === '');
                                    setTribunaisFiltrados(filtrados);
                                    setTribunalSelecionado('');
                                    setDados([]);
                                    setUltimaPaginacao(null);
                                }}
                                style={styles.picker}
                                dropdownIconColor={styles.pickerDropdownColor}
                            >
                                <Picker.Item label="1. Selecione o Tipo de Justiça" value="" style={styles.pickerItemStyle} />
                                {tiposJustica.map((tipo, i) => (
                                    <Picker.Item
                                        key={`${tipo.value}-${i}`}
                                        label={tipo.label}
                                        value={tipo.value}
                                        style={tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {tipoJusticaSelecionado !== '' && (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tribunalSelecionado}
                                    onValueChange={(itemValue) => {
                                        setTribunalSelecionado(itemValue);
                                        if (itemValue !== tribunalSelecionado) {
                                            setDados([]);
                                            setUltimaPaginacao(null);
                                        }
                                    }}
                                    style={styles.picker}
                                    enabled={tribunaisFiltrados.length > 1}
                                    dropdownIconColor={styles.pickerDropdownColor}
                                >
                                    {tribunaisFiltrados.map((tribunal, i) => (
                                        <Picker.Item
                                            key={`${tribunal.url}-${i}-${tribunal.nome}`}
                                            label={tribunal.url === '' ? '2. Selecione o Tribunal' : tribunal.nome}
                                            value={tribunal.url}
                                            style={tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {/* Input Número Processo com Filtro e Placeholder */}
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 00000000000000000000 (20 números)" // Placeholder atualizado
                            placeholderTextColor={styles.placeholderTextColor}
                            value={input}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9]/g, ''); // Remove não-dígitos
                                setInput(numericText); // Atualiza estado apenas com números
                            }}
                            keyboardType={'numeric'}
                            maxLength={20}
                            onSubmitEditing={() => buscarDados(false)}
                            returnKeyType="search"
                            editable={!carregando}
                        />

                        {/* Botões Buscar e Nova Pesquisa */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Buscar"
                                onPress={() => buscarDados(false)}
                                disabled={carregando || !tribunalSelecionado || !input.trim() || input.trim().length < 7 } // Validação mínima
                                color={styles.primaryColor}
                            />
                        </View>
                        {dados.length > 0 && !carregando && (
                            <View style={styles.buttonContainer}>
                                <Button title="Nova Pesquisa" onPress={limparTela} color={styles.secondaryButtonColor} />
                            </View>
                        )}
                        {carregando && ( <ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} /> )}
                    </View>
                }
                // Dados e Renderização da Lista
                data={dados}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={({ item }) => {
                    // Reutiliza a lógica complexa de formatação, agora dentro de <Text>
                    const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                    const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []);
                    const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || ''; const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || ''; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ') : ''; return `(${polo || 'N/I'}) ${nome} ${tipoPessoa ? `[${tipoPessoa}]` : ''}${documento ? ` (Doc: ${documento})` : ''}${advogadosFormatados}`; }).join('\n\n') : 'Partes não informadas';
                    const movimentosArray = d.movimentos || d.movimento;
                    const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = `\n     -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? `\n     -> ${complementoTexto}` : ''; return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Sem movimentações registradas.';
                    const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';
                    const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
                    const assuntosTexto = Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'Não informado');
                    const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                    const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
                    const custas = dadosBasicos.custasRecolhidas;
                    const juizo100 = dadosBasicos.juizo100Digital;

                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso} selectable={true}><Text>📄 Processo: </Text><Text style={styles.valor}>{d.numeroProcesso || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏛️ Tribunal: </Text><Text style={styles.valor}>{d.tribunal || 'N/D'}</Text><Text> | Grau: </Text><Text style={styles.valor}>{d.grau || 'N/D'}</Text><Text> | Sigilo: </Text><Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏷️ Classe: </Text><Text style={styles.valor}>{d.classe?.codigo ? `(${d.classe.codigo}) ` : ''}{d.classe?.nome || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📍 Órgão Julgador: </Text><Text style={styles.valor}>{orgaoTexto} {d.orgaoJulgador?.codigo ? `(${d.orgaoJulgador.codigo})` : ''}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📅 Ajuizamento: </Text><Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>💰 Valor Causa: </Text><Text style={styles.valor}>{valorCausaTexto}</Text></Text>
                            {(custas !== undefined && custas !== null) && <Text style={styles.linha} selectable={true}><Text>💲 Custas Recolhidas: </Text><Text style={styles.valor}>{custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text> }
                            {prioridades && <Text style={styles.linha} selectable={true}><Text>🚩 Prioridade(s): </Text><Text style={styles.valor}>{prioridades}</Text></Text> }
                            {(juizo100 === true || juizo100 === false) && <Text style={styles.linha} selectable={true}><Text>💻 Juízo 100% Digital: </Text><Text style={styles.valor}>{juizo100 ? 'Sim' : 'Não'}</Text></Text> }
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes:</Text><Text style={styles.valor} selectable={true}>{partesFormatadas}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Últimas 15):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
                        </View>
                    );
                }}
                // Rodapé (SEM Voltar, COM Share)
                ListFooterComponent={
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {dados.length > 0 && ultimaPaginacao && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Carregar mais resultados" onPress={() => buscarDados(true)} disabled={carregando} color={styles.primaryColor} />
                                </View>
                            )}
                            {dados.length > 0 && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Compartilhar Resultados" onPress={onShare} color={styles.primaryColor} />
                                </View>
                            )}
                        </View>
                    ) : null
                }
                // Mensagem para lista vazia
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

// --- Função de Estilos Dinâmicos (COMPLETA e com estilos do picker) ---
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
        linha: { fontSize: 15, marginBottom: 2, color: textColor, lineHeight: 22 },
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