// Api.js (renderItem Melhorado)
import React, { useState, useMemo } from 'react';
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert, ActivityIndicator, Keyboard, ScrollView // Adicionado ScrollView para garantir
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext';

// --- Componente Principal ---
export default function Api({ navigation }) {
    // --- States ---
    // ... (Seus states mantidos) ...
    const [input, setInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);

    // --- Contexto e Estilos ---
    // ... (Seu acesso ao tema mantido) ...
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Listas (Tipos e Tribunais) ---
    // ... (Suas listas mantidas) ...
    const tiposJustica = [ { label: 'Tribunais Superiores', value: 'Superior' }, { label: 'Justiça Federal', value: 'Federal' }, { label: 'Justiça Estadual', value: 'Estadual' }, { label: 'Justiça do Trabalho', value: 'Trabalho' }, { label: 'Justiça Eleitoral', value: 'Eleitoral' }, { label: 'Justiça Militar', value: 'Militar' } ];
    const tribunais = [ /* SUA LISTA COMPLETA AQUI */ { nome: 'Selecione um tribunal', url: '', tipo: '' }, { nome: 'Tribunal Superior do Trabalho - TST', url: 'api_publica_tst', tipo: 'Superior' }, { nome: 'Tribunal Superior Eleitoral - TSE', url: 'api_publica_tse', tipo: 'Superior' }, { nome: 'Tribunal Superior de Justiça - STJ', url: 'api_publica_stj', tipo: 'Superior' }, { nome: 'Tribunal Superior Militar - TSM', url: 'api_publica_stm', tipo: 'Superior' }, { nome: 'Tribunal Regional Federal da 1ª Região - TRF1', url: 'api_publica_trf1', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 2ª Região - TRF2', url: 'api_publica_trf2', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 3ª Região - TRF3', url: 'api_publica_trf3', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 4ª Região - TRF4', url: 'api_publica_trf4', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 5ª Região - TRF5', url: 'api_publica_trf5', tipo: 'Federal' }, { nome: 'Tribunal Regional Federal da 6ª Região - TRF6', url: 'api_publica_trf6', tipo: 'Federal' }, { nome: 'Tribunal de Justiça do Acre - TJ-AC', url: 'api_publica_tjac', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Alagoas - TJ-AL', url: 'api_publica_tjal', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Amapá - TJ-AP', url: 'api_publica_tjap', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Amazonas - TJ-AM', url: 'api_publica_tjam', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça da Bahia - TJ-BA', url: 'api_publica_tjba', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Ceará - TJ-CE', url: 'api_publica_tjce', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Distrito Federal - TJ-DF', url: 'api_publica_tjdft', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Espírito Santo - TJ-ES', url: 'api_publica_tjes', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Goiás - TJ-GO', url: 'api_publica_tjgo', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Maranhão - TJ-MA', url: 'api_publica_tjma', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Minas Gerais - TJ-MG', url: 'api_publica_tjmg', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Mato Grosso do Sul - TJ-MS', url: 'api_publica_tjms', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Mato Grosso - TJ-MT', url: 'api_publica_tjmt', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Pará - TJ-PA', url: 'api_publica_tjpa', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça da Paraíba - TJ-PB', url: 'api_publica_tjpb', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Paraná - TJ-PR', url: 'api_publica_tjpr', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Pernambuco - TJ-PE', url: 'api_publica_tjpe', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Piauí - TJ-PI', url: 'api_publica_tjpi', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio de Janeiro - TJ-RJ', url: 'api_publica_tjrj', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio Grande do Norte - TJ-RN', url: 'api_publica_tjrn', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Rio Grande do Sul - TJ-RS', url: 'api_publica_tjrs', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Rondônia - TJ-RO', url: 'api_publica_tjro', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Roraima - TJ-RR', url: 'api_publica_tjrr', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Santa Catarina - TJ-SC', url: 'api_publica_tjsc', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de São Paulo TJ-SP', url: 'api_publica_tjsp', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça de Sergipe -TJ-SE', url: 'api_publica_tjse', tipo: 'Estadual' }, { nome: 'Tribunal de Justiça do Tocantins - TJ-TO', url: 'api_publica_tjto', tipo: 'Estadual' }, { nome: 'Tribunal Regional do Trabalho da 1ª Região - TRT1', url: 'api_publica_trt1', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 2ª Região - TRT2', url: 'api_publica_trt2', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 3ª Região - TRT3', url: 'api_publica_trt3', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 4ª Região - TRT4', url: 'api_publica_trt4', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 5ª Região - TRT5', url: 'api_publica_trt5', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 6ª Região - TRT6', url: 'api_publica_trt6', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 7ª Região - TRT7', url: 'api_publica_trt7', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 8ª Região - TRT8', url: 'api_publica_trt8', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 9ª Região - TRT9', url: 'api_publica_trt9', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 10ª Região - TRT10', url: 'api_publica_trt10', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 11ª Região - TRT11', url: 'api_publica_trt11', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 12ª Região - TRT12', url: 'api_publica_trt12', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 13ª Região - TRT13', url: 'api_publica_trt13', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 14ª Região - TRT14', url: 'api_publica_trt14', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 15ª Região - TRT15', url: 'api_publica_trt15', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 16ª Região - TRT16', url: 'api_publica_trt16', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 17ª Região - TRT17', url: 'api_publica_trt17', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 18ª Região - TRT18', url: 'api_publica_trt18', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 19ª Região - TRT19', url: 'api_publica_trt19', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 20ª Região - TRT20', url: 'api_publica_trt20', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 21ª Região - TRT21', url: 'api_publica_trt21', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 22ª Região - TRT22', url: 'api_publica_trt22', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 23ª Região - TRT23', url: 'api_publica_trt23', tipo: 'Trabalho' }, { nome: 'Tribunal Regional do Trabalho da 24ª Região - TRT24', url: 'api_publica_trt24', tipo: 'Trabalho' }, { nome: 'Tribunal Regional Eleitoral do Acre - TRE-AC', url: 'api_publica_tre-ac', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Alagoas - TRE-AL', url: 'api_publica_tre-al', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Amapá - TRE-AP', url: 'api_publica_tre-ap', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Amazonas - TRE-AM', url: 'api_publica_tre-am', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral da Bahia - TRE-BA', url: 'api_publica_tre-ba', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Ceará - TRE-CE', url: 'api_publica_tre-ce', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Distrito Federal - TRE-DF', url: 'api_publica_tre-df', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Espírito Santo - TRE-ES', url: 'api_publica_tre-es', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Goiás - TRE-GO', url: 'api_publica_tre-go', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Maranhão - TRE-MA', url: 'api_publica_tre-ma', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Minas Gerais - TRE-MG', url: 'api_publica_tre-mg', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Mato Grosso do Sul - TRE-MS', url: 'api_publica_tre-ms', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Mato Grosso - TRE-MT', url: 'api_publica_tre-mt', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Pará - TRE-PA', url: 'api_publica_tre-pa', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral da Paraíba - TRE-PB', url: 'api_publica_tre-pb', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Paraná - TRE-PR', url: 'api_publica_tre-pr', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Pernambuco - TRE-PE', url: 'api_publica_tre-pe', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Piauí - TRE-PI', url: 'api_publica_tre-pi', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio de Janeiro - TRE-RJ', url: 'api_publica_tre-rj', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio Grande do Norte - TRE-RN', url: 'api_publica_tre-rn', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul - TRE-RS', url: 'api_publica_tre-rs', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Rondônia - TRE-RO', url: 'api_publica_tre-ro', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Roraima - TRE-RR', url: 'api_publica_tre-rr', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Santa Catarina - TRE-SC', url: 'api_publica_tre-sc', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de São Paulo - TRE-SP', url: 'api_publica_tre-sp', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral de Sergipe - TRE-SE', url: 'api_publica_tre-se', tipo: 'Eleitoral' }, { nome: 'Tribunal Regional Eleitoral do Tocantins - TRE-TO', url: 'api_publica_tre-to', tipo: 'Eleitoral' }, { nome: 'Tribunal de Justiça Militar de Minas Gerais -TJM-MG', url: 'api_publica_tjmmg', tipo: 'Militar' }, { nome: 'Tribunal de Justiça Militar do Rio Grande do Sul - TJM-RS', url: 'api_publica_tjmrs', tipo: 'Militar' }, { nome: 'Tribunal de Justiça Militar de São Paulo - TJM-SP', url: 'api_publica_tjmsp', tipo: 'Militar' }, ];

    // --- Funções ---
    const limparTela = () => { /* ...código mantido... */ setInput(''); setDados([]); setTribunalSelecionado(''); setTipoJusticaSelecionado(''); setTribunaisFiltrados([]); setUltimaPaginacao(null); };
    const buscarDados = async (paginando = false) => { /* ...código mantido (busca por número)... */
        Keyboard.dismiss();
        if (!input.trim()) { Alert.alert("Erro", "Digite o número do processo."); return; }
        if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; }
        setCarregando(true);
        if (!paginando) setDados([]);

        try {
            const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`;
            // Query original por número de processo
            let query = {
                size: 10,
                query: { match: { numeroProcesso: input.trim() } },
                // Usar sort por id.keyword para paginação robusta, se possível/desejado
                // sort: [{ "id.keyword": { order: "asc" } }]
                // Ou manter a ordenação original se preferir:
                sort: [{ "@timestamp": { order: "asc" } }] // OU por dataAjuizamento?
            };
            // Lógica de paginação com search_after (requer 'sort' consistente)
            if (paginando && ultimaPaginacao) {
                query.search_after = ultimaPaginacao;
            }
            console.log("Enviando query:", JSON.stringify(query, null, 2));
            const resposta = await axios.post(url, query, {
                headers: {
                    Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==",
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log("Resposta API:", resposta.data);
            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                setDados(prev => paginando ? [...prev, ...novosDados] : [...novosDados]); // Correção: usa spread operator para nova busca
                const ultimo = novosDados[novosDados.length - 1];
                // Guarda o valor de 'sort' do último item para a próxima página
                if (ultimo && ultimo.sort) {
                    setUltimaPaginacao(ultimo.sort);
                    console.log("Próxima paginação (search_after):", ultimo.sort);
                } else {
                    setUltimaPaginacao(null); // Sem valor sort, não pode paginar assim
                }
            } else {
                if (!paginando) {
                    setDados([]); // Garante limpar dados se não achar nada na primeira busca
                    Alert.alert("Nada encontrado", "Nenhuma informação para esse processo.");
                } else {
                    Alert.alert("Fim dos resultados", "Não há mais informações para carregar.");
                }
                setUltimaPaginacao(null); // Fim da paginação
            }
        } catch (erro) {
            setDados([]); setUltimaPaginacao(null);
            let errorMsg = `Falha na busca.`;
            if (erro.response) { console.error("Erro detalhado API:", erro.response.data); errorMsg += `\nStatus: ${erro.response.status}. Detalhes: ${JSON.stringify(erro.response.data.error)}`; }
            else if (erro.request) { console.error("Erro de requisição:", erro.request); errorMsg += `\nDetalhes: Sem resposta do servidor ou timeout.`; }
            else { console.error("Erro de configuração:", erro.message); errorMsg += `\nDetalhes: ${erro.message}`; }
            Alert.alert("Erro", errorMsg); console.error("Objeto de erro completo:", erro);
        }
        setCarregando(false);
    };
    const formatarData = (dataStr) => { /* ...código mantido... */ if (!dataStr) return "Não informada"; try { const date = new Date(dataStr); if (isNaN(date.getTime())) { return dataStr; } return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } catch { return dataStr; } };

    // --- Renderização do Componente ---
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={ /* ... Seu Header com Pickers e Input de Número ... */
                    <View>
                        <Text style={styles.titulo}>Busca por número de processo:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={tipoJusticaSelecionado} onValueChange={(itemValue) => { setTipoJusticaSelecionado(itemValue); const filtrados = tribunais.filter(t => t.tipo === itemValue || t.tipo === ''); setTribunaisFiltrados(filtrados); setTribunalSelecionado(''); setDados([]); setUltimaPaginacao(null); }} style={styles.picker} >
                                <Picker.Item label="1. Selecione o tipo de tribunal" value="" style={styles.pickerItemStyle} />
                                {tiposJustica.map((tipo, i) => ( <Picker.Item key={`${tipo.value}-${i}`} label={tipo.label} value={tipo.value} style={tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                            </Picker>
                        </View>
                        {tipoJusticaSelecionado !== '' && (
                            <View style={styles.pickerContainer}>
                                <Picker selectedValue={tribunalSelecionado} onValueChange={(itemValue) => { if (itemValue !== '') { setTribunalSelecionado(itemValue); setDados([]); setUltimaPaginacao(null); } else { setTribunalSelecionado(''); } }} style={styles.picker} >
                                    {tribunaisFiltrados.map((tribunal, i) => ( <Picker.Item key={`${tribunal.url}-${i}-${tribunal.nome}`} label={tribunal.url === '' ? '2. Selecione o tribunal' : tribunal.nome} value={tribunal.url} style={tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} /> ))}
                                </Picker>
                            </View>
                        )}
                        <TextInput style={styles.input} placeholder="* 3. Digite o número do processo" value={input} onChangeText={setInput} keyboardType={'numeric'} placeholderTextColor={styles.placeholderTextColor} onSubmitEditing={() => buscarDados(false)} returnKeyType="search" />
                        <View style={styles.buttonContainer}>
                            <Button title="Buscar" onPress={() => buscarDados(false)} disabled={carregando || !tribunalSelecionado || !input.trim()} color={styles.primaryColor} />
                        </View>
                        {dados.length > 0 && !carregando && ( <View style={styles.buttonContainer}> <Button title="Nova pesquisa" onPress={limparTela} color={styles.secondaryButtonColor} /> </View> )}
                        {carregando && (<ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} />)}
                    </View>
                }
                data={dados}
                keyExtractor={(item, index) => item._id || index.toString()}
                // ###############################################################
                // #####               renderItem MELHORADO                #####
                // ###############################################################
                renderItem={({ item }) => {
                    const d = item._source || {}; // Acessa os dados principais
                    const dadosBasicos = d.dadosBasicos || {}; // Acessa dadosBasicos se existir

                    // --- Formatação das Partes ---
                    // Tenta acessar 'partes' diretamente OU via 'dadosBasicos.polo'
                    const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []);
                    const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => {
                        const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida';
                        const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?';
                        const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || '';
                        const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || '';

                        // Formata advogados SE existirem
                        const advogadosArray = pt.advogados || pt.advogado; // Tenta ambos os nomes
                        const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0
                            ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ')
                            : '';

                        return `(${polo || 'N/I'}) ${nome} ${tipoPessoa ? `[${tipoPessoa}]` : ''}${documento ? ` (Doc: ${documento})` : ''}${advogadosFormatados}`;
                    }).join('\n\n') : 'Partes não informadas ou formato inesperado';

                    // --- Formatação dos Movimentos ---
                    const movimentosArray = d.movimentos || d.movimento; // Tenta ambos os nomes
                    const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0
                        ? movimentosArray.slice(0, 15).map((m, idx) => { // Limita a 15 para não ficar enorme
                        const data = formatarData(m.dataHora);
                        const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A';
                        const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito';

                        // Formata complementos tabelados, se existirem
                        let complementosStr = '';
                        if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){
                            complementosStr = m.complementosTabelados
                                .map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`)
                                .join('; ');
                            complementosStr = `\n     -> ${complementosStr}`;
                        }
                        // Pega complementos de texto livre também, se houver
                        const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || '');
                        const complementoTextoFormatado = complementoTexto ? `\n     -> ${complementoTexto}` : '';


                        return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`;
                    }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') // Indica se há mais movimentos
                        : 'Sem movimentações registradas.';

                    // --- Outros Campos ---
                    const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' };
                    const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';

                    const formatoTexto = d.formato?.nome || dadosBasicos.formato?.nome || 'N/I';
                    const sistemaTexto = d.sistema?.nome || dadosBasicos.sistema?.nome || 'N/I';
                    const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/I';
                    const assuntosTexto = Array.isArray(d.assuntos) && d.assuntos.length > 0
                        ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ')
                        : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0
                            ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ')
                            : 'Não informado');

                    const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa;
                    const valorCausaTexto = typeof valorCausaNum === 'number'
                        ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'Não informado';

                    const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');


                    // --- Renderização do Item ---
                    return (
                        <View style={styles.item}>
                            {/* Bloco 1: Identificação */}
                            <Text style={styles.tituloProcesso}>
                                <Text>📄 Processo: </Text>
                                <Text style={styles.valor}>{d.numeroProcesso || 'N/D'}</Text>
                            </Text>
                            <Text style={styles.linha}>
                                <Text>🏛️ Tribunal: </Text><Text style={styles.valor}>{d.tribunal || 'N/D'}</Text>
                                <Text> | Grau: </Text><Text style={styles.valor}>{d.grau || 'N/D'}</Text>
                                <Text> | Sigilo: </Text><Text style={styles.valor}>{nivelSigiloTexto}</Text>
                            </Text>
                            <Text style={styles.linha}>
                                <Text>🏷️ Classe: </Text>
                                <Text style={styles.valor}>{d.classe?.codigo ? `(${d.classe.codigo}) ` : ''}{d.classe?.nome || 'N/D'}</Text>
                            </Text>
                            <Text style={styles.linha}>
                                <Text>📍 Órgão Julgador: </Text>
                                <Text style={styles.valor}>{orgaoTexto} {d.orgaoJulgador?.codigo ? `(${d.orgaoJulgador.codigo})` : ''}</Text>
                            </Text>

                            {/* Bloco 2: Datas e Valores */}
                            <Text style={styles.linha}>
                                <Text>📅 Ajuizamento: </Text><Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text>
                            </Text>
                            <Text style={styles.linha}>
                                <Text>💰 Valor Causa: </Text><Text style={styles.valor}>{valorCausaTexto}</Text>
                            </Text>
                            {/* Exibe custas se disponível (novo campo v1.1) */}
                            {(dadosBasicos.custasRecolhidas !== undefined && dadosBasicos.custasRecolhidas !== null) &&
                                <Text style={styles.linha}>
                                    <Text>💲 Custas Recolhidas: </Text>
                                    <Text style={styles.valor}>{dadosBasicos.custasRecolhidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                                </Text>
                            }
                            {/* Exibe prioridades se houver (novo campo v1.1) */}
                            {prioridades &&
                                <Text style={styles.linha}>
                                    <Text>🚩 Prioridade(s): </Text><Text style={styles.valor}>{prioridades}</Text>
                                </Text>
                            }
                            {/* Exibe se é 100% digital (novo campo v1.1) */}
                            {(dadosBasicos.juizo100Digital === true || dadosBasicos.juizo100Digital === false) && // Verifica se existe booleanamente
                                <Text style={styles.linha}>
                                    <Text>💻 Juízo 100% Digital: </Text><Text style={styles.valor}>{dadosBasicos.juizo100Digital ? 'Sim' : 'Não'}</Text>
                                </Text>
                            }


                            {/* Bloco 3: Assuntos */}
                            <View style={{marginTop: 6}}>
                                <Text style={styles.linha}>🧾 Assunto(s):</Text>
                                <Text style={styles.valor}>{assuntosTexto}</Text>
                            </View>

                            {/* Bloco 4: Partes */}
                            <View style={{marginTop: 6}}>
                                <Text style={styles.linha}>👤 Partes:</Text>
                                <Text style={styles.valor}>{partesFormatadas}</Text>
                            </View>

                            {/* Bloco 5: Movimentações */}
                            <View style={{marginTop: 6}}>
                                <Text style={styles.linha}>🗂️ Movimentações (Últimas 15):</Text>
                                <Text style={[styles.valor, { fontSize: 13 }]}>{movimentacoes}</Text> {/* Fonte menor para movimentos */}
                            </View>
                        </View>
                    );
                }}
                // ###############################################################
                // #####            FIM DO renderItem MELHORADO            #####
                // ###############################################################
                ListFooterComponent={
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {dados.length > 0 && ultimaPaginacao && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Carregar mais resultados" onPress={() => buscarDados(true)} disabled={carregando} color={styles.primaryColor} />
                                </View>
                            )}
                            <View style={styles.buttonContainer}>
                                <Button title="VOLTAR PARA A HOME" onPress={() => navigation.navigate('Home')} color={styles.primaryColor} disabled={carregando} />
                            </View>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

// --- Função para gerar estilos dinâmicos ---
function getThemedStyles(isDark) {
    // ... COLE SUA FUNÇÃO COMPLETA AQUI ...
    const backgroundColor = isDark ? '#121212' : '#f8f9fa'; const textColor = isDark ? '#e0e0e0' : '#212529'; const borderColor = isDark ? '#444' : '#ced4da'; const placeholderTextColor = isDark ? '#777' : '#6c757d'; const primaryColor = isDark ? '#66bfff' : '#007bff'; const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; const itemBorderColor = primaryColor; const titleColor = isDark ? '#bbdffd' : '#003366'; const valueColor = isDark ? '#b0b0b0' : '#343a40'; const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff'; const pickerItemBgSelected = isDark ? '#004c99' : '#e0e0e0'; const pickerItemColorSelected = isDark ? '#ffffff' : '#000000'; const secondaryButtonColor = '#FFA500';
    return StyleSheet.create({ container: { flex: 1, backgroundColor: backgroundColor }, contentContainer: { padding: 20, paddingBottom: 40 }, titulo: { fontSize: 20, marginBottom: 15, fontWeight: 'bold', color: textColor, textAlign: 'center' }, input: { borderWidth: 1, borderColor: borderColor, backgroundColor: isDark ? '#2a2a2a' : '#fff', color: textColor, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 5, marginBottom: 15, fontSize: 16 }, pickerContainer: { borderWidth: 1, borderColor: borderColor, borderRadius: 5, marginBottom: 15, backgroundColor: pickerBackgroundColor, justifyContent: 'center' }, picker: { color: textColor, height: 50 }, pickerItemStyle: { color: textColor, backgroundColor: pickerBackgroundColor, fontSize: 14 }, pickerItemSelectedStyle: { color: pickerItemColorSelected, backgroundColor: pickerItemBgSelected, fontSize: 14 }, item: { padding: 15, marginVertical: 8, backgroundColor: itemBackgroundColor, borderLeftWidth: 5, borderLeftColor: itemBorderColor, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 2, elevation: 2 }, tituloProcesso: { fontWeight: 'bold', fontSize: 17, marginBottom: 8, color: titleColor }, linha: { fontSize: 15, marginBottom: 2, /* Reduzido */ color: textColor, lineHeight: 22 }, valor: { color: valueColor, fontWeight: 'normal', fontSize: 15, lineHeight: 22 }, activityIndicator: { marginVertical: 30 }, buttonContainer: { marginVertical: 8 }, footerButtons: { marginTop: 20, paddingBottom: 30 }, placeholderTextColor: placeholderTextColor, primaryColor: primaryColor, secondaryButtonColor: secondaryButtonColor, });
}