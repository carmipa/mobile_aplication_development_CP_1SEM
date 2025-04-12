// Api.js com suporte a tema claro/escuro e botão de troca de tema
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert, ActivityIndicator, Keyboard, ScrollView, useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useThemeContext } from '../context/ThemeContext'; // ✅ Novo: acesso ao tema

export default function Api({ navigation }) {
    const [input, setInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);

    const { currentTheme, cycleTheme } = useThemeContext(); // ✅ Novo: acesso ao tema e troca

    const isDark = currentTheme === 'dark';
    const backgroundColor = isDark ? '#000' : '#fff';
    const textColor = isDark ? '#fff' : '#000';

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
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dataStr;
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <View>
                        <Text style={styles.titulo}>Busca por número de processo:</Text>

                        <Picker
                            selectedValue={tipoJusticaSelecionado}
                            onValueChange={(itemValue) => {
                                setTipoJusticaSelecionado(itemValue);
                                const filtrados = tribunais.filter(t => t.tipo === itemValue);
                                setTribunaisFiltrados(filtrados);
                                setTribunalSelecionado('');
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecione o tipo de tribunal" value="" />
                            {tiposJustica.map((tipo, i) => (
                                <Picker.Item
                                    key={i}
                                    label={tipo.label}
                                    value={tipo.value}
                                    style={{
                                        backgroundColor: tipoJusticaSelecionado === tipo.value ? '#d6e0f0' : 'transparent',  // Azul claro
                                        color: tipoJusticaSelecionado === tipo.value ? '#003366' : 'black', // Cor de texto para o item selecionado
                                    }}
                                />
                            ))}
                        </Picker>

                        {tipoJusticaSelecionado !== '' && (
                            <Picker
                                selectedValue={tribunalSelecionado}
                                onValueChange={(v) => setTribunalSelecionado(v)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecione o tribunal" value="" />
                                {tribunaisFiltrados.map((tribunal, i) => (
                                    <Picker.Item
                                        key={i}
                                        label={tribunal.nome}
                                        value={tribunal.url}
                                        style={{
                                            backgroundColor: tribunalSelecionado === tribunal.url ? '#d6e0f0' : 'transparent', // Azul claro
                                            color: tribunalSelecionado === tribunal.url ? '#003366' : 'black', // Cor de texto para o item selecionado
                                        }}
                                    />
                                ))}
                            </Picker>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Digite o número do processo"
                            value={input}
                            onChangeText={setInput}
                            keyboardType={'numeric'}
                        />

                        <Button title="Buscar" onPress={() => buscarDados(false)} disabled={carregando} />

                        {dados.length > 0 && (
                            <View style={{ marginVertical: 10 }}>
                                <Button title="Nova pesquisa" onPress={limparTela} color="orange" />
                            </View>
                        )}

                        {carregando && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}
                    </View>
                }
                data={dados}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    const d = item._source || item;
                    const partes = Array.isArray(d.partes)
                        ? d.partes.map(p => {
                            const nome = p.nome ?? 'Desconhecido';
                            const tipo = p.tipoParte ?? 'Tipo não informado';
                            const advs = Array.isArray(p.advogados)
                                ? p.advogados.map(a => `${a.nome} (${a.numeroOAB})`).join('; ')
                                : '';
                            return `🙋 ${nome} - ${tipo}${advs ? `\n🧑\u200d⚖️ Adv: ${advs}` : ''}`;
                        }).join('\n')
                        : 'Não informado';

                    const movimentacoes = Array.isArray(d.movimentos)
                        ? d.movimentos.map(m => {
                            const data = formatarData(m.dataHora);
                            const desc = m.nome ?? 'Sem descrição';
                            return `📌 ${data}: ${desc}`;
                        }).join('\n')
                        : 'Sem movimentações.';

                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso}>📄 Processo: <Text style={styles.valor}>{d.numeroProcesso}</Text></Text>
                            {d.tribunal && <Text style={styles.linha}>🏛️ Tribunal: <Text style={styles.valor}>{d.tribunal}</Text></Text>}
                            {d.grau && <Text style={styles.linha}>📚 Grau: <Text style={styles.valor}>{d.grau}</Text></Text>}
                            {d.classe?.nome && <Text style={styles.linha}>🏷️ Classe: <Text style={styles.valor}>{d.classe.nome}</Text></Text>}
                            {d.assuntos && <Text style={styles.linha}>🧾 Assunto(s): <Text style={styles.valor}>{d.assuntos.map(a => a.nome).join(" | ")}</Text></Text>}
                            {d.dataAjuizamento && <Text style={styles.linha}>📅 Ajuizamento: <Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>}
                            {partes && <Text style={styles.linha}>👤 Partes:\n<Text style={styles.valor}>{partes}</Text></Text>}
                            {movimentacoes && <Text style={styles.linha}>🗂️ Movimentações:\n<Text style={styles.valor}>{movimentacoes}</Text></Text>}
                        </View>
                    );
                }}
                ListFooterComponent={
                    <View style={{ marginVertical: 20 }}>
                        {dados.length > 0 && (
                            <Button title="Carregar mais resultados" onPress={() => buscarDados(true)} disabled={carregando} />
                        )}
                        <View style={{ marginTop: 20 }}>
                            <Button title="VOLTAR PARA A HOME" onPress={() => navigation.navigate('Home')} />
                        </View>
                    </View>
                }
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff'
    },
    titulo: {
        fontSize: 20,
        marginBottom: 10
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10
    },
    picker: {
        borderWidth: 1,
        borderColor: '#999',
        marginBottom: 10,
        fontSize: 12,
    },
    selectedItem: {
        backgroundColor: '#c8e6c9', // Cor para o item selecionado
        color: '#00796b', // Cor do texto do item selecionado
    },
    item: {
        padding: 15,
        marginVertical: 6,
        backgroundColor: '#eaf4ff',
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        borderRadius: 8
    },
    tituloProcesso: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 6,
        color: '#003366'
    },
    linha: {
        fontSize: 15,
        marginBottom: 4
    },
    valor: {
        fontWeight: '600',
        color: '#333'
    }
});
