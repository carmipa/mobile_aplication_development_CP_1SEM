// Api.js CORRIGIDO - Preservando a lista de tribunais e com estilos no final
import React, { useState, useMemo } from 'react'; // Importa useMemo
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    FlatList,
    Alert,
    ActivityIndicator,
    Keyboard,
    ScrollView // ScrollView não está sendo usado diretamente aqui, mas pode ser útil
    // useColorScheme foi removido pois usamos o ThemeContext
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext'; // ✅ Acesso ao tema

// --- Componente Principal ---
export default function Api({ navigation }) {
    // --- Seus States ---
    const [input, setInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);

    // --- Acesso e Cálculo do Tema ---
    const { currentTheme } = useThemeContext(); // Não precisamos do cycleTheme aqui por enquanto
    const isDark = currentTheme === 'dark';

    // --- Gera os estilos MEMOIZADOS chamando a função no final do arquivo ---
    // useMemo garante que getThemedStyles só é chamado se 'isDark' mudar
    const styles = useMemo(() => getThemedStyles(isDark), [isDark]);

    // --- Suas Listas de Tipos e Tribunais (INTACTAS) ---
    const tiposJustica = [
        { label: 'Tribunais Superiores', value: 'Superior' },
        { label: 'Justiça Federal', value: 'Federal' },
        { label: 'Justiça Estadual', value: 'Estadual' },
        { label: 'Justiça do Trabalho', value: 'Trabalho' },
        { label: 'Justiça Eleitoral', value: 'Eleitoral' },
        { label: 'Justiça Militar', value: 'Militar' }
    ];

    // 👇 SUA LISTA COMPLETA DE TRIBUNAIS PRESERVADA 👇
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
    // ☝️ SUA LISTA COMPLETA DE TRIBUNAIS PRESERVADA ☝️

    // --- Suas Funções (INTACTAS) ---
    const limparTela = () => {
        setInput('');
        setDados([]);
        setTribunalSelecionado('');
        setTipoJusticaSelecionado('');
        setTribunaisFiltrados([]);
        setUltimaPaginacao(null);
    };

    const buscarDados = async (paginando = false) => {
        Keyboard.dismiss();
        if (!input.trim()) {
            Alert.alert("Erro", "Digite o número do processo.");
            return;
        }
        if (!tribunalSelecionado) {
            Alert.alert("Erro", "Selecione um tribunal.");
            return;
        }
        setCarregando(true);
        if (!paginando) setDados([]);

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
                    Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==",
                    'Content-Type': 'application/json'
                }
            });
            if (resposta.data?.hits?.hits?.length > 0) {
                const novosDados = resposta.data.hits.hits;
                setDados(prev => [...prev, ...novosDados]);
                const ultimo = novosDados[novosDados.length - 1];
                setUltimaPaginacao(ultimo.sort);
            } else {
                if (!paginando) Alert.alert("Nada encontrado", "Nenhuma informação para esse processo.");
            }
        } catch (erro) {
            Alert.alert("Erro", "Falha na busca.");
            console.error(erro.response?.data || erro.message);
        }
        setCarregando(false);
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return "Não informada";
        try {
            const date = new Date(dataStr);
            // Verifica se a data é válida antes de formatar
            if (isNaN(date.getTime())) {
                return dataStr; // Retorna a string original se inválida
            }
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dataStr; // Retorna a string original em caso de erro
        }
    };

    // --- Renderização do Componente ---
    // O JSX abaixo usa os 'styles' gerados pelo useMemo/getThemedStyles
    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainer}
                // Evita que o teclado esconda o input/botões
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        <Text style={styles.titulo}>Busca por número de processo:</Text>

                        {/* Picker Tipo Justiça */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tipoJusticaSelecionado}
                                onValueChange={(itemValue) => {
                                    setTipoJusticaSelecionado(itemValue);
                                    const filtrados = tribunais.filter(t => t.tipo === itemValue);
                                    setTribunaisFiltrados(filtrados);
                                    setTribunalSelecionado(''); // Limpa tribunal ao mudar tipo
                                }}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecione o tipo de tribunal" value="" style={styles.pickerItemStyle} />
                                {tiposJustica.map((tipo, i) => (
                                    <Picker.Item
                                        key={`${tipo.value}-${i}`} // Chave mais robusta
                                        label={tipo.label}
                                        value={tipo.value}
                                        style={tipoJusticaSelecionado === tipo.value
                                            ? styles.pickerItemSelectedStyle
                                            : styles.pickerItemStyle
                                        }
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* Picker Tribunal */}
                        {tipoJusticaSelecionado !== '' && (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tribunalSelecionado}
                                    onValueChange={(itemValue) => setTribunalSelecionado(itemValue)}
                                    style={styles.picker}
                                    enabled={tribunaisFiltrados.length > 0} // Desabilita se não houver tribunais
                                >
                                    <Picker.Item label="Selecione o tribunal" value="" style={styles.pickerItemStyle}/>
                                    {tribunaisFiltrados.map((tribunal, i) => (
                                        <Picker.Item
                                            key={`${tribunal.url}-${i}`} // Chave mais robusta
                                            label={tribunal.nome}
                                            value={tribunal.url}
                                            style={tribunalSelecionado === tribunal.url
                                                ? styles.pickerItemSelectedStyle
                                                : styles.pickerItemStyle
                                            }
                                        />
                                    ))}
                                </Picker>
                            </View>
                        )}

                        {/* Input Número Processo */}
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o número do processo"
                            value={input}
                            onChangeText={setInput}
                            keyboardType={'numeric'}
                            placeholderTextColor={styles.placeholderTextColor} // Cor dinâmica
                            onSubmitEditing={() => buscarDados(false)} // Permite buscar com Enter/Go
                            returnKeyType="search" // Melhora UX do teclado
                        />

                        {/* Botão Buscar */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Buscar"
                                onPress={() => buscarDados(false)}
                                disabled={carregando || !tribunalSelecionado || !input} // Desabilita se carregando ou sem dados
                                color={styles.primaryColor} // Cor dinâmica
                            />
                        </View>

                        {/* Botão Nova Pesquisa */}
                        {dados.length > 0 && !carregando && (
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Nova pesquisa"
                                    onPress={limparTela}
                                    color={styles.secondaryButtonColor} // Cor específica mantida
                                />
                            </View>
                        )}

                        {/* Loading */}
                        {carregando && (
                            <ActivityIndicator
                                size="large"
                                color={styles.primaryColor} // Cor dinâmica
                                style={styles.activityIndicator}
                            />
                        )}
                    </View>
                }
                data={dados}
                keyExtractor={(item, index) => item._id || index.toString()} // Usa _id se disponível
                renderItem={({ item }) => {
                    const d = item._source || item; // Usa _source se presente

                    // Formatação robusta das partes e advogados
                    const partes = Array.isArray(d.partes)
                        ? d.partes.map((p, idx) => {
                            const nome = p.nome || 'Nome não informado';
                            const tipo = p.tipoParte || 'Tipo não informado';
                            const advogados = Array.isArray(p.advogados)
                                ? p.advogados.map(a => `${a.nome || 'Advogado'} (${a.numeroOAB || 'OAB'})`).join('; ')
                                : '';
                            return `🙋 ${nome} (${tipo})${advogados ? `\n   🧑‍⚖️ Adv: ${advogados}` : ''}`;
                        }).join('\n')
                        : 'Partes não informadas';

                    // Formatação das movimentações
                    const movimentacoes = Array.isArray(d.movimentos) && d.movimentos.length > 0
                        ? d.movimentos.map((m, idx) => {
                            const data = formatarData(m.dataHora);
                            const nomeMovimento = m.nome || 'Movimento sem nome';
                            // Adicionar detalhes se existirem (pode precisar de ajuste conforme a API)
                            const complemento = m.complemento ? ` (${m.complemento})` : '';
                            return `📌 ${data}: ${nomeMovimento}${complemento}`;
                        }).join('\n')
                        : 'Sem movimentações registradas.';

                    // Renderiza o item da lista
                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso}>
                                📄 Processo: <Text style={styles.valor}>{d.numeroProcesso || 'Número não disponível'}</Text>
                            </Text>
                            {d.tribunal && <Text style={styles.linha}>🏛️ Tribunal: <Text style={styles.valor}>{d.tribunal}</Text></Text>}
                            {d.grau && <Text style={styles.linha}>📚 Grau: <Text style={styles.valor}>{d.grau}</Text></Text>}
                            {d.classe?.nome && <Text style={styles.linha}>🏷️ Classe: <Text style={styles.valor}>{d.classe.nome}</Text></Text>}
                            {Array.isArray(d.assuntos) && d.assuntos.length > 0 && (
                                <Text style={styles.linha}>
                                    🧾 Assunto(s): <Text style={styles.valor}>{d.assuntos.map(a => a.nome || 'Assunto').join(" | ")}</Text>
                                </Text>
                            )}
                            {d.dataAjuizamento && <Text style={styles.linha}>📅 Ajuizamento: <Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>}
                            {partes && <Text style={styles.linha}>👤 Partes:{'\n'}<Text style={styles.valor}>{partes}</Text></Text>}
                            <Text style={styles.linha}>🗂️ Movimentações:{'\n'}<Text style={styles.valor}>{movimentacoes}</Text></Text>
                        </View>
                    );
                }}
                ListFooterComponent={
                    // Garante que os botões só apareçam se houver dados ou carregando
                    (dados.length > 0 || carregando) ? (
                        <View style={styles.footerButtons}>
                            {/* Botão Carregar Mais */}
                            {dados.length > 0 && ultimaPaginacao && !carregando && ( // Mostra apenas se pode carregar mais e não está carregando
                                <View style={styles.buttonContainer}>
                                    <Button
                                        title="Carregar mais resultados"
                                        onPress={() => buscarDados(true)}
                                        disabled={carregando}
                                        color={styles.primaryColor} // Cor dinâmica
                                    />
                                </View>
                            )}
                            {/* Botão Voltar */}
                            <View style={styles.buttonContainer}>
                                <Button
                                    title="VOLTAR PARA A HOME"
                                    onPress={() => navigation.navigate('Home')}
                                    color={styles.primaryColor} // Cor dinâmica
                                    disabled={carregando} // Desabilita enquanto carrega
                                />
                            </View>
                        </View>
                    ) : null // Não mostra o footer se não houver dados e não estiver carregando
                }
                // Indicador de 'sem resultados' (opcional)
                // ListEmptyComponent={
                //     !carregando && input && tribunalSelecionado ? ( // Mostra apenas se buscou e não achou
                //         <View style={{alignItems: 'center', marginTop: 50}}>
                //             <Text style={styles.linha}>Nenhum resultado encontrado.</Text>
                //         </View>
                //     ) : null
                // }
            />
        </View>
    );
}

// --- Função para gerar estilos dinâmicos (NO FINAL DO ARQUIVO) ---
// Usar 'function' aqui permite hoisting, podendo ser chamada antes no código.
function getThemedStyles(isDark) {
    // --- Cores Base ---
    const backgroundColor = isDark ? '#121212' : '#f8f9fa';
    const textColor = isDark ? '#e0e0e0' : '#212529';
    const borderColor = isDark ? '#444' : '#ced4da';
    const placeholderTextColor = isDark ? '#777' : '#6c757d';
    const primaryColor = isDark ? '#66bfff' : '#007bff';
    const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff'; // Fundo do item mais sutil no modo escuro
    const itemBorderColor = primaryColor;
    const titleColor = isDark ? '#bbdffd' : '#003366'; // Cor do título do processo adaptada
    const valueColor = isDark ? '#b0b0b0' : '#343a40'; // Cor dos valores adaptada
    const pickerBackgroundColor = isDark ? '#2a2a2a' : '#ffffff';
    const pickerItemBgSelected = isDark ? '#004c99' : '#d6e0f0'; // Azul mais escuro no dark
    const pickerItemColorSelected = isDark ? '#ffffff' : '#003366';
    const secondaryButtonColor = 'orange'; // Mantida como laranja

    // --- StyleSheet ---
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        contentContainer: {
            padding: 20,
            paddingBottom: 40, // Garante espaço extra no final
        },
        titulo: {
            fontSize: 20,
            marginBottom: 15,
            fontWeight: 'bold',
            color: textColor,
            textAlign: 'center', // Centralizar título
        },
        input: {
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: isDark ? '#2a2a2a' : '#fff',
            color: textColor,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 5,
            marginBottom: 15,
            fontSize: 16, // Aumentar fonte do input
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: 5,
            marginBottom: 15,
            backgroundColor: pickerBackgroundColor,
            justifyContent: 'center', // Centraliza o texto no Android
        },
        picker: {
            color: textColor,
            height: 50,
            // Tentar remover width 100% se causar problemas
        },
        // Estilos dos itens do Picker (a serem aplicados via 'style' prop)
        pickerItemStyle: {
            color: textColor,
            backgroundColor: pickerBackgroundColor,
            //fontSize: 16 // (Opcional) Ajustar fonte dos itens
        },
        pickerItemSelectedStyle: {
            color: pickerItemColorSelected,
            backgroundColor: pickerItemBgSelected,
            // fontSize: 16,
            // fontWeight: 'bold' // (Opcional) Destacar selecionado
        },
        item: {
            padding: 15,
            marginVertical: 8,
            backgroundColor: itemBackgroundColor,
            borderLeftWidth: 5,
            borderLeftColor: itemBorderColor,
            borderRadius: 8,
            shadowColor: "#000", // Sombra leve (opcional)
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 2,
            elevation: 2, // Elevação para Android
        },
        tituloProcesso: {
            fontWeight: 'bold',
            fontSize: 17,
            marginBottom: 8,
            color: titleColor,
        },
        linha: {
            fontSize: 15,
            marginBottom: 6, // Um pouco mais de espaço
            color: textColor,
            lineHeight: 22,
        },
        valor: {
            color: valueColor,
            fontWeight: '500', // Um pouco menos bold que o padrão
        },
        activityIndicator: {
            marginVertical: 30, // Mais espaço vertical
        },
        buttonContainer: {
            marginVertical: 8, // Menos espaço entre botões
        },
        footerButtons: {
            marginTop: 20, // Espaço antes dos botões do footer
            paddingBottom: 30,
        },
        // Exporta cores como "estilos" para serem usadas em props
        placeholderTextColor: placeholderTextColor,
        primaryColor: primaryColor,
        secondaryButtonColor: secondaryButtonColor,
    });
};