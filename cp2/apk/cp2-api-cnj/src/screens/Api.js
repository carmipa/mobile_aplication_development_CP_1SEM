// --- src/screens/Api.js ---
// Tela principal para busca e exibição de processos da API DataJud

// --- Importações ---
import React, { useState, useMemo } from 'react'; // Core React e Hooks
import {
    StyleSheet, Text, View, TextInput, Button, FlatList, Alert,
    ActivityIndicator, Keyboard, Share, // Componentes React Native
    Pressable // Para botões customizados
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Seletor Dropdown
import axios from 'axios'; // Para chamadas HTTP API
import { useThemeContext } from '../context/ThemeContext'; // Hook para acessar o tema (dark/light)
import { tiposJustica, tribunais } from '../data/tribunaisData.js'; // Listas de tipos e tribunais
import { generateAndSharePdfReport } from '../utils/pdfService'; // Função para gerar e compartilhar PDF
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; // Ícones

// --- Definição do Componente da Tela ---
export default function Api({ navigation }) {

    // --- Estados do Componente ---
    const [input, setInput] = useState(''); // Armazena o número do processo digitado
    const [dados, setDados] = useState([]); // Armazena os resultados da busca da API
    const [carregando, setCarregando] = useState(false); // Indica se uma busca está em andamento (para loading)
    const [tribunalSelecionado, setTribunalSelecionado] = useState(''); // Armazena a URL do tribunal selecionado
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState(''); // Armazena o tipo de justiça selecionado
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]); // Lista de tribunais filtrada pelo tipo de justiça
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null); // Guarda informações para buscar a próxima página de resultados

    // --- Contexto e Estilos ---
    const { currentTheme } = useThemeContext(); // Obtém o tema atual (light/dark)
    const isDark = currentTheme === 'dark'; // Flag booleana para facilitar o uso do tema
    // Calcula os estilos baseado no tema, usando useMemo para otimização
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Funções Auxiliares ---
    // Limpa todos os campos e resultados, voltando ao estado inicial
    const limparTela = () => {
        setInput(''); setDados([]); setTribunalSelecionado(''); setTipoJusticaSelecionado('');
        setTribunaisFiltrados([]); setUltimaPaginacao(null); Keyboard.dismiss();
    };

    // Formata uma string de data (ISO ou similar) para o formato DD/MM/YYYY ou retorna texto padrão
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

    // --- Função Principal de Busca na API ---
    const buscarDados = async (paginando = false) => {
        Keyboard.dismiss(); // Esconde o teclado
        // Validações básicas de entrada
        if (!input.trim()) { Alert.alert("Erro", "Digite o número do processo."); return; }
        if (!tribunalSelecionado) { Alert.alert("Erro", "Selecione um tribunal."); return; }

        setCarregando(true); // Ativa o indicador de loading
        // Se não for paginação (nova busca), reseta os dados e a paginação
        if (!paginando) { setDados([]); setUltimaPaginacao(null); }

        try {
            // Monta a URL da API e a query de busca
            const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`;
            const apiKey = "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=="; // !! ATENÇÃO: Risco de Segurança !!
            let query = {
                size: 10, // Quantidade de resultados por página
                query: { match: { numeroProcesso: input.trim() } },
                sort: [{ "@timestamp": { order: "asc" } }] // Ordena para paginação
            };
            // Adiciona parâmetro para paginação se necessário
            if (paginando && ultimaPaginacao) { query.search_after = ultimaPaginacao; }

            // Faz a requisição POST para a API
            const resposta = await axios.post(url, query, { headers: { Authorization: apiKey, 'Content-Type': 'application/json' }, timeout: 30000 });

            // Processa a resposta
            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                // Adiciona ou substitui os dados no estado
                setDados(prev => paginando ? [...prev, ...novosDados] : [...novosDados]);
                // Guarda o valor 'sort' do último item para a próxima paginação
                const ultimo = novosDados[novosDados.length - 1];
                setUltimaPaginacao(ultimo?.sort || null);
            } else {
                // Se não vieram dados
                if (!paginando) { setDados([]); Alert.alert("Nada encontrado", "Nenhuma informação para este processo neste tribunal."); }
                else { Alert.alert("Fim dos resultados", "Não há mais informações para carregar."); }
                setUltimaPaginacao(null); // Impede tentativas de paginar mais
            }
        } catch (erro) {
            // Tratamento de erro da API
            setDados([]); setUltimaPaginacao(null); // Limpa em caso de erro
            let errorMsg = "Falha na busca.";
            if (erro.response) { console.error("Erro API:", erro.response.status, erro.response.data); errorMsg += `\nStatus: ${erro.response.status}.`; } else if (erro.request) { console.error("Erro Req:", erro.request); errorMsg += "\nSem resposta do servidor/timeout."; } else { console.error("Erro:", erro.message); errorMsg += `\n${erro.message}`; } Alert.alert("Erro", errorMsg); console.error("Objeto erro completo:", erro);
        } finally {
            setCarregando(false); // Desativa o loading, mesmo com erro
        }
    };

    // --- Função de Compartilhar Texto Simples ---
    const onShareTexto = async () => {
        if (dados.length === 0) { Alert.alert("Sem dados", "Não há resultados para compartilhar."); return; }
        try {
            // Monta a string de mensagem formatada
            let message = `Consulta Processual (Número: ${input}):\n`;
            dados.forEach((item, index) => {
                // Lógica de formatação de texto (complexa, baseada nos dados da API)
                const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                // ... (extração e formatação de todas as variáveis: numeroProcesso, tribunal, partesFormatadas, movimentacoes, etc.) ...
                const numeroProcesso = d.numeroProcesso || 'N/D'; const tribunal = d.tribunal || 'N/D'; const grau = d.grau || 'N/D'; const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'N/I'; const classeCodigo = d.classe?.codigo; const classeNome = d.classe?.nome || 'N/D'; const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D'; const orgaoCodigo = d.orgaoJulgador?.codigo; const dataAjuizamento = formatarData(d.dataAjuizamento); const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I'; const custas = dadosBasicos.custasRecolhidas; const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || ''); const juizo100 = dadosBasicos.juizo100Digital; const assuntosTexto = (Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'N/I')); const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []); const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? ` | Adv: ${advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ')}` : ''; return `(${polo || 'N/I'}) ${nome}${advogadosFormatados}`; }).join('\n') : 'N/I'; const movimentosArray = d.movimentos || d.movimento; const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = ` -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? ` -> ${complementoTexto}` : ''; return `[${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Nenhuma.';

                // Concatena na mensagem principal
                message += `\n--- Processo ${index + 1} ---\n`; message += `Número: ${numeroProcesso}\n`; message += `Tribunal: ${tribunal} | Grau: ${grau} | Sigilo: ${nivelSigiloTexto}\n`; message += `Classe: ${classeCodigo ? `(${classeCodigo}) ` : ''}${classeNome}\n`; message += `Órgão Julgador: ${orgaoTexto} ${orgaoCodigo ? `(${orgaoCodigo})` : ''}\n`; message += `Ajuizamento: ${dataAjuizamento}\n`; message += `Valor Causa: ${valorCausaTexto}\n`; if (custas !== undefined && custas !== null) message += `Custas Recolhidas: ${custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`; if (prioridades) message += `Prioridade(s): ${prioridades}\n`; if (juizo100 === true || juizo100 === false) message += `Juízo 100% Digital: ${juizo100 ? 'Sim' : 'Não'}\n`; message += `\nAssunto(s):\n${assuntosTexto}\n`; message += `\nPartes:\n${partesFormatadas}\n`; message += `\nMovimentações (Últimas 15):\n${movimentacoes}\n`; message += `--------------------\n`;
            }); // Fim do loop forEach

            // Limpa a formatação final e adiciona nota sobre limite
            if(message.endsWith('--------------------\n')) { message = message.substring(0, message.length - '--------------------\n'.length); }
            if (dados.some(item => (item._source?.movimentos || item._source?.movimento)?.length > 15)) { message += "\n(Lista de movimentos limitada aos 15 mais recentes por processo)"; }

            // Chama a API Share nativa do React Native
            await Share.share({ message, title: `Consulta Processo ${input}` });

        } catch (error) {
            Alert.alert("Erro ao Compartilhar", `Falha ao preparar/enviar dados: ${error.message}`);
            console.error("Erro ao compartilhar texto:", error);
        }
    };

    // --- Função para chamar o Serviço de Geração/Compartilhamento de PDF ---
    const handleGeneratePdf = async () => {
        if (dados.length === 0) {
            Alert.alert("Sem dados", "Não há resultados para gerar o PDF.");
            return;
        }
        setCarregando(true); // Ativa o indicador de loading
        try {
            // Chama a função importada do serviço pdfService.js
            await generateAndSharePdfReport(dados, input, isDark); // Passa os dados, input e tema
        } catch (error) {
            // O erro é tipicamente tratado dentro do service com Alert, mas logamos aqui também.
            console.error("Erro retornado ao chamar generateAndSharePdfReport:", error);
        } finally {
            setCarregando(false); // Desativa o loading, importante no finally
        }
    };

    // --- Renderização do Componente (JSX) ---
    return (
        // Container principal da tela
        <View style={styles.container}>
            {/* Lista rolável para exibir os resultados */}
            <FlatList
                contentContainerStyle={styles.contentContainer} // Estilo do conteúdo interno da lista
                keyboardShouldPersistTaps="handled" // Garante que toques funcionem mesmo com teclado aberto
                // --- Cabeçalho da Lista (Controles de Busca) ---
                ListHeaderComponent={
                    <View>
                        <Text style={styles.titulo}>Busca por Número de Processo</Text>

                        {/* Seletor Tipo de Justiça */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tipoJusticaSelecionado}
                                onValueChange={(itemValue) => {
                                    setTipoJusticaSelecionado(itemValue);
                                    const filtrados = tribunais.filter(t => t.tipo === itemValue || t.url === '');
                                    setTribunaisFiltrados(filtrados);
                                    setTribunalSelecionado(''); setDados([]); setUltimaPaginacao(null); // Reseta
                                }}
                                style={styles.picker}
                                dropdownIconColor={styles.pickerDropdownColor}
                            >
                                <Picker.Item label="1. Selecione o Tipo de Justiça" value="" style={styles.pickerItemStyle} />
                                {tiposJustica.map((tipo) => (
                                    <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} style={tipoJusticaSelecionado === tipo.value ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} />
                                ))}
                            </Picker>
                        </View>

                        {/* Seletor Tribunal (condicional) */}
                        {tipoJusticaSelecionado !== '' && (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tribunalSelecionado}
                                    onValueChange={(itemValue) => { setTribunalSelecionado(itemValue); if (itemValue !== tribunalSelecionado) { setDados([]); setUltimaPaginacao(null); } }}
                                    style={styles.picker}
                                    enabled={tribunaisFiltrados.length > 1}
                                    dropdownIconColor={styles.pickerDropdownColor}
                                >
                                    {tribunaisFiltrados.map((tribunal) => (
                                        <Picker.Item key={tribunal.url || 'select-tribunal'} label={tribunal.url === '' ? '2. Selecione o Tribunal' : tribunal.nome} value={tribunal.url} style={tribunalSelecionado === tribunal.url ? styles.pickerItemSelectedStyle : styles.pickerItemStyle} />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {/* Input Número do Processo */}
                        <TextInput
                            style={styles.input}
                            placeholder="Digite apenas os 20 números do processo"
                            placeholderTextColor={styles.placeholderTextColor}
                            value={input}
                            onChangeText={(text) => { const numericText = text.replace(/[^0-9]/g, ''); if (numericText.length <= 20) { setInput(numericText); } }}
                            keyboardType={'numeric'}
                            maxLength={20}
                            onSubmitEditing={() => buscarDados(false)} // Permite buscar via teclado
                            returnKeyType="search"
                            editable={!carregando}
                        />

                        {/* Botão Buscar */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Buscar"
                                onPress={() => buscarDados(false)}
                                disabled={carregando || !tribunalSelecionado || !input.trim() || input.trim().length < 7} // Validação
                                color={styles.primaryColor}
                            />
                        </View>

                        {/* Botão Nova Pesquisa (condicional) */}
                        {dados.length > 0 && !carregando && (
                            <View style={styles.buttonContainer}>
                                <Button title="Nova Pesquisa" onPress={limparTela} color={styles.secondaryButtonColor} />
                            </View>
                        )}

                        {/* Indicador de Loading (condicional) */}
                        {carregando && (
                            <ActivityIndicator size="large" color={styles.primaryColor} style={styles.activityIndicator} />
                        )}
                    </View>
                } // Fim do ListHeaderComponent

                // --- Configuração da Lista ---
                data={dados} // Array de dados a serem renderizados
                keyExtractor={(item, index) => item._id || `processo-${index}`} // Função para gerar chave única por item

                // --- Renderização de Cada Item da Lista ---
                renderItem={({ item }) => {
                    // Extração e formatação de dados para este item específico (lógica complexa)
                    const d = item._source || {}; const dadosBasicos = d.dadosBasicos || {};
                    // ... (variáveis: partesFormatadas, movimentacoes, nivelSigiloTexto, etc.) ...
                    const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []); const partesFormatadas = Array.isArray(partesArray) ? partesArray.map((pt, idx) => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; const tipoPessoa = pt.tipoPessoa || pt.pessoa?.tipoPessoa || ''; const documento = pt.numeroDocumentoPrincipal || pt.pessoa?.numeroDocumentoPrincipal || ''; const advogadosArray = pt.advogados || pt.advogado; const advogadosFormatados = Array.isArray(advogadosArray) && advogadosArray.length > 0 ? "\n   🧑‍⚖️ Adv: " + advogadosArray.map(a => `${a.nome || 'Advogado'} (${a.inscricao || a.numeroOAB || 'OAB'})`).join('; ') : ''; return `(${polo || 'N/I'}) ${nome} ${tipoPessoa ? `[${tipoPessoa}]` : ''}${documento ? ` (Doc: ${documento})` : ''}${advogadosFormatados}`; }).join('\n\n') : 'Partes não informadas';
                    const movimentosArray = d.movimentos || d.movimento; const movimentacoes = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map((m, idx) => { const data = formatarData(m.dataHora); const codigoMov = m.codigo || m.movimentoNacional?.codigoNacional || m.movimentoLocal?.codigoMovimento || 'N/A'; const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; let complementosStr = ''; if(Array.isArray(m.complementosTabelados) && m.complementosTabelados.length > 0){ complementosStr = m.complementosTabelados.map(c => `${c.nome || c.descricao || '?'} (${c.valor || '?'})`).join('; '); complementosStr = `\n     -> ${complementosStr}`; } const complementoTexto = Array.isArray(m.complemento) ? m.complemento.join('; ') : (m.complemento || ''); const complementoTextoFormatado = complementoTexto ? `\n     -> ${complementoTexto}` : ''; return `📌 [${codigoMov}] ${data}: ${nomeMovimento}${complementoTextoFormatado}${complementosStr}`; }).join('\n') + (movimentosArray.length > 15 ? '\n...' : '') : 'Sem movimentações registradas.';
                    const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' }; const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';
                    const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
                    const assuntosTexto = Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'Não informado');
                    const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa; const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
                    const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
                    const custas = dadosBasicos.custasRecolhidas;
                    const juizo100 = dadosBasicos.juizo100Digital;

                    // Retorna o JSX para o item (Card do processo)
                    // !! IMPORTANTE: Verifique cuidadosamente se TODO texto aqui está dentro de <Text> !!
                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso} selectable={true}><Text>📄 Processo: </Text><Text style={styles.valor}>{d.numeroProcesso || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏛️ Tribunal: </Text><Text style={styles.valor}>{d.tribunal || 'N/D'}</Text><Text> | Grau: </Text><Text style={styles.valor}>{d.grau || 'N/D'}</Text><Text> | Sigilo: </Text><Text style={styles.valor}>{nivelSigiloTexto}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>🏷️ Classe: </Text><Text style={styles.valor}>{d.classe?.codigo ? `(${d.classe.codigo}) ` : ''}{d.classe?.nome || 'N/D'}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📍 Órgão Julgador: </Text><Text style={styles.valor}>{orgaoTexto} {d.orgaoJulgador?.codigo ? `(${d.orgaoJulgador.codigo})` : ''}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>📅 Ajuizamento: </Text><Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>
                            <Text style={styles.linha} selectable={true}><Text>💰 Valor Causa: </Text><Text style={styles.valor}>{valorCausaTexto}</Text></Text>
                            {/* Renderização condicional para Custas */}
                            {(custas !== undefined && custas !== null) && <Text style={styles.linha} selectable={true}><Text>💲 Custas Recolhidas: </Text><Text style={styles.valor}>{custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text> }
                            {/* Renderização condicional para Prioridades */}
                            {prioridades ? <Text style={styles.linha} selectable={true}><Text>🚩 Prioridade(s): </Text><Text style={styles.valor}>{prioridades}</Text></Text> : null }
                            {/* Renderização condicional para Juizo 100% */}
                            {(juizo100 === true || juizo100 === false) ? <Text style={styles.linha} selectable={true}><Text>💻 Juízo 100% Digital: </Text><Text style={styles.valor}>{juizo100 ? 'Sim' : 'Não'}</Text></Text> : null }
                            {/* Seções de Assuntos, Partes e Movimentos */}
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🧾 Assunto(s):</Text><Text style={styles.valor} selectable={true}>{assuntosTexto}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>👤 Partes:</Text><Text style={styles.valor} selectable={true}>{partesFormatadas}</Text></View>
                            <View style={{marginTop: 6}}><Text style={styles.linha}>🗂️ Movimentações (Últimas 15):</Text><Text style={[styles.valor, { fontSize: 13 }]} selectable={true}>{movimentacoes}</Text></View>
                        </View>
                    );
                }} // Fim do renderItem

                // --- Rodapé da Lista (Botões de Ação Pós-Busca) ---
                ListFooterComponent={
                    (dados.length > 0 || carregando) ? ( // Só mostra o rodapé se houver dados ou carregando
                        <View style={styles.footerButtons}>
                            {/* Botão Carregar Mais (condicional) */}
                            {dados.length > 0 && ultimaPaginacao && !carregando && (
                                <View style={styles.buttonContainer}>
                                    <Button title="Carregar mais resultados" onPress={() => buscarDados(true)} disabled={carregando} color={styles.primaryColor} />
                                </View>
                            )}

                            {/* Container para botões de compartilhar (condicional) */}
                            {dados.length > 0 && !carregando && (
                                <View style={styles.shareButtonsContainer}>
                                    {/* Wrapper para botão Resultado (Texto) */}
                                    <View style={styles.shareButtonItemWrapper}>
                                        <Pressable
                                            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1, backgroundColor: styles.primaryColor }]} // Cor azul
                                            onPress={onShareTexto}
                                            disabled={carregando}
                                        >
                                            <Ionicons name="share-social-outline" size={20} color={styles.iconButtonIconColor} />
                                            <Text style={styles.iconButtonText}>Resultado</Text>
                                        </Pressable>
                                    </View>

                                    {/* Wrapper para botão Gerar PDF */}
                                    <View style={styles.shareButtonItemWrapper}>
                                        <Pressable
                                            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1, backgroundColor: styles.primaryColor }]} // Cor azul
                                            onPress={handleGeneratePdf}
                                            disabled={carregando}
                                        >
                                            <MaterialCommunityIcons name="file-pdf-box" size={20} color={styles.iconButtonIconColor} />
                                            <Text style={styles.iconButtonText}>Gerar PDF</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : null // Não mostra nada no rodapé se não houver dados e não estiver carregando
                } // Fim do ListFooterComponent

                // --- Componente para Lista Vazia (Após busca sem resultados) ---
                ListEmptyComponent={
                    !carregando && tribunalSelecionado && input.trim().length >= 7 ? ( // Condição mais específica
                        <View style={{alignItems: 'center', marginTop: 50}}>
                            <Text style={styles.textoInfo}>Nenhum resultado encontrado para esta busca.</Text>
                        </View>
                    ) : null // Não mostra nada se a busca não foi feita ou está carregando
                } // Fim do ListEmptyComponent
            />
        </View> // Fim do container principal
    ); // Fim do return do componente
} // Fim do componente Api

// --- Função de Estilos Dinâmicos ---
// (Define os estilos baseados no tema dark/light)
function getThemedStyles(isDark) {
    // Definição das cores
    const backgroundColor = isDark ? '#121212' : '#f8f9fa'; const textColor = isDark ? '#e0e0e0' : '#212529'; const borderColor = isDark ? '#444' : '#ced4da'; const placeholderTextColor = isDark ? '#777' : '#6c757d'; const primaryColor = isDark ? '#66bfff' : '#007bff'; const secondaryButtonColor = isDark ? '#ffcc66' : '#FFA500'; const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; const itemBorderColor = primaryColor; const titleColor = isDark ? '#bbdffd' : '#003366'; const valueColor = isDark ? '#cccccc' : '#343a40'; const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff'; const pickerItemBgSelected = isDark ? '#004c99' : '#cfe2ff'; const pickerItemColorSelected = isDark ? '#ffffff' : '#003d99'; const pickerDropdownColor = isDark ? '#aaaaaa' : '#888888'; const infoTextColor = isDark ? '#aaaaaa' : '#6c757d'; const iconButtonIconColor = '#ffffff'; const iconButtonTextColor = '#ffffff';

    // Retorna o objeto StyleSheet
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor },
        contentContainer: { paddingHorizontal: 15, paddingVertical: 20, paddingBottom: 40 },
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
        buttonContainer: { marginVertical: 8 }, // Para botões padrão (Buscar, Nova Pesquisa, Carregar Mais)
        footerButtons: { marginTop: 20, paddingBottom: 30 }, // Container geral dos botões no rodapé
        textoInfo: { fontSize: 16, color: infoTextColor, textAlign: 'center' }, // Texto para lista vazia
        placeholderTextColor: placeholderTextColor,
        primaryColor: primaryColor,
        secondaryButtonColor: secondaryButtonColor,
        // Estilos para botões de compartilhar lado a lado
        shareButtonsContainer: { flexDirection: 'row', marginTop: 10, marginHorizontal: -5, },
        shareButtonItemWrapper: { flex: 1, marginHorizontal: 5, },
        iconButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, },
        iconButtonIconColor: iconButtonIconColor,
        iconButtonText: { color: iconButtonTextColor, marginLeft: 8, fontSize: 14, fontWeight: 'bold', },
    });
} // Fim de getThemedStyles