// Arquivo: Api.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function Api({ navigation }) {
    const [input, setInput] = useState('');
    const [dados, setDados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);

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
        { nome: 'Tribunal Superior do Trabalho', url: 'api_publica_tst', tipo: 'Superior' },
        { nome: 'Tribunal Superior Eleitoral', url: 'api_publica_tse', tipo: 'Superior' },
        { nome: 'Tribunal Superior de Justiça', url: 'api_publica_stj', tipo: 'Superior' },
        { nome: 'Tribunal Superior Militar', url: 'api_publica_stm', tipo: 'Superior' },

        // Justiça Federal
        { nome: 'Tribunal Regional Federal da 1ª Região', url: 'api_publica_trf1', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 2ª Região', url: 'api_publica_trf2', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 3ª Região', url: 'api_publica_trf3', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 4ª Região', url: 'api_publica_trf4', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 5ª Região', url: 'api_publica_trf5', tipo: 'Federal' },
        { nome: 'Tribunal Regional Federal da 6ª Região', url: 'api_publica_trf6', tipo: 'Federal' },

        // Justiça Estadual
        { nome: 'Tribunal de Justiça do Acre', url: 'api_publica_tjac', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Alagoas', url: 'api_publica_tjal', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Amapá', url: 'api_publica_tjap', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Amazonas', url: 'api_publica_tjam', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça da Bahia', url: 'api_publica_tjba', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Ceará', url: 'api_publica_tjce', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Distrito Federal e Territórios', url: 'api_publica_tjdft', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Espírito Santo', url: 'api_publica_tjes', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Goiás', url: 'api_publica_tjgo', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Maranhão', url: 'api_publica_tjma', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Minas Gerais', url: 'api_publica_tjmg', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Mato Grosso do Sul', url: 'api_publica_tjms', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Mato Grosso', url: 'api_publica_tjmt', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Pará', url: 'api_publica_tjpa', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça da Paraíba', url: 'api_publica_tjpb', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Paraná', url: 'api_publica_tjpr', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Pernambuco', url: 'api_publica_tjpe', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Piauí', url: 'api_publica_tjpi', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio de Janeiro', url: 'api_publica_tjrj', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio Grande do Norte', url: 'api_publica_tjrn', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Rio Grande do Sul', url: 'api_publica_tjrs', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Rondônia', url: 'api_publica_tjro', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Roraima', url: 'api_publica_tjrr', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Santa Catarina', url: 'api_publica_tjsc', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de São Paulo', url: 'api_publica_tjsp', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça de Sergipe', url: 'api_publica_tjse', tipo: 'Estadual' },
        { nome: 'Tribunal de Justiça do Tocantins', url: 'api_publica_tjto', tipo: 'Estadual' },

        // Justiça do Trabalho
        { nome: 'Tribunal Regional do Trabalho da 1ª Região', url: 'api_publica_trt1', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 2ª Região', url: 'api_publica_trt2', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 3ª Região', url: 'api_publica_trt3', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 4ª Região', url: 'api_publica_trt4', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 5ª Região', url: 'api_publica_trt5', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 6ª Região', url: 'api_publica_trt6', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 7ª Região', url: 'api_publica_trt7', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 8ª Região', url: 'api_publica_trt8', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 9ª Região', url: 'api_publica_trt9', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 10ª Região', url: 'api_publica_trt10', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 11ª Região', url: 'api_publica_trt11', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 12ª Região', url: 'api_publica_trt12', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 13ª Região', url: 'api_publica_trt13', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 14ª Região', url: 'api_publica_trt14', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 15ª Região', url: 'api_publica_trt15', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 16ª Região', url: 'api_publica_trt16', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 17ª Região', url: 'api_publica_trt17', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 18ª Região', url: 'api_publica_trt18', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 19ª Região', url: 'api_publica_trt19', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 20ª Região', url: 'api_publica_trt20', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 21ª Região', url: 'api_publica_trt21', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 22ª Região', url: 'api_publica_trt22', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 23ª Região', url: 'api_publica_trt23', tipo: 'Trabalho' },
        { nome: 'Tribunal Regional do Trabalho da 24ª Região', url: 'api_publica_trt24', tipo: 'Trabalho' },

        // Justiça Eleitoral
        { nome: 'Tribunal Regional Eleitoral do Acre', url: 'api_publica_tre-ac', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Alagoas', url: 'api_publica_tre-al', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Amapá', url: 'api_publica_tre-ap', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Amazonas', url: 'api_publica_tre-am', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral da Bahia', url: 'api_publica_tre-ba', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Ceará', url: 'api_publica_tre-ce', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Distrito Federal', url: 'api_publica_tre-df', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Espírito Santo', url: 'api_publica_tre-es', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Goiás', url: 'api_publica_tre-go', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Maranhão', url: 'api_publica_tre-ma', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Minas Gerais', url: 'api_publica_tre-mg', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso do Sul', url: 'api_publica_tre-ms', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Mato Grosso', url: 'api_publica_tre-mt', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Pará', url: 'api_publica_tre-pa', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral da Paraíba', url: 'api_publica_tre-pb', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Paraná', url: 'api_publica_tre-pr', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Pernambuco', url: 'api_publica_tre-pe', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Piauí', url: 'api_publica_tre-pi', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio de Janeiro', url: 'api_publica_tre-rj', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Norte', url: 'api_publica_tre-rn', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul', url: 'api_publica_tre-rs', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Rondônia', url: 'api_publica_tre-ro', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Roraima', url: 'api_publica_tre-rr', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Santa Catarina', url: 'api_publica_tre-sc', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de São Paulo', url: 'api_publica_tre-sp', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral de Sergipe', url: 'api_publica_tre-se', tipo: 'Eleitoral' },
        { nome: 'Tribunal Regional Eleitoral do Tocantins', url: 'api_publica_tre-to', tipo: 'Eleitoral' },

        // Justiça Militar
        { nome: 'Tribunal de Justiça Militar de Minas Gerais', url: 'api_publica_tjmmg', tipo: 'Militar' },
        { nome: 'Tribunal de Justiça Militar do Rio Grande do Sul', url: 'api_publica_tjmrs', tipo: 'Militar' },
        { nome: 'Tribunal de Justiça Militar de São Paulo', url: 'api_publica_tjmsp', tipo: 'Militar' },
    ];

    const buscarDados = async () => {
        if (!input.trim()) {
            Alert.alert("Erro", "Digite o número do processo.");
            return;
        }

        if (!tribunalSelecionado) {
            Alert.alert("Erro", "Selecione um tribunal.");
            return;
        }

        setCarregando(true);
        setDados([]);

        try {
            const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`;
            const query = {
                query: {
                    match: {
                        numeroProcesso: input.trim()
                    }
                }
            };

            const resposta = await axios.post(url, query, {
                headers: {
                    Authorization: "APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==",
                    'Content-Type': 'application/json'
                }
            });

            if (resposta.data?.hits?.hits?.length > 0) {
                setDados(resposta.data.hits.hits);
            } else {
                Alert.alert("Nada encontrado", "Nenhuma informação para esse processo.");
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
            <Text style={styles.titulo}>Buscar processo por número</Text>

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
                <Picker.Item label="Selecione o tipo de justiça" value="" />
                {tiposJustica.map((tipo, i) => (
                    <Picker.Item key={i} label={tipo.label} value={tipo.value} />
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
                        <Picker.Item key={i} label={tribunal.nome} value={tribunal.url} />
                    ))}
                </Picker>
            )}

            <TextInput
                style={styles.input}
                placeholder="Digite o número do processo"
                value={input}
                onChangeText={setInput}
            />

            <Button title="Buscar" onPress={buscarDados} disabled={carregando} />

            {carregando && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

            <FlatList
                data={dados}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    const d = item._source || item;

                    const formatarData = (dataStr) => {
                        try {
                            const date = new Date(dataStr);
                            return date.toLocaleDateString('pt-BR');
                        } catch {
                            return dataStr;
                        }
                    };

                    const partes = Array.isArray(d.partes)
                        ? d.partes.map(p => {
                            const nome = p.nome ?? 'Desconhecido';
                            const tipo = p.tipoParte ?? 'Tipo não informado';
                            const advs = Array.isArray(p.advogados)
                                ? p.advogados.map(a => `${a.nome} (${a.numeroOAB})`).join('; ')
                                : '';
                            return `🙋 ${nome} - ${tipo}${advs ? `\n🧑‍⚖️ Adv: ${advs}` : ''}`;
                        }).join('\n')
                        : 'Não informado';

                    const movimentacoes = Array.isArray(d.movimentacoes)
                        ? d.movimentacoes.map(m => {
                            const data = formatarData(m.dataHora);
                            const desc = m.descricao ?? 'Sem descrição';
                            return `📌 ${data}: ${desc}`;
                        }).join('\n')
                        : 'Sem movimentações.';

                    return (
                        <View style={styles.item}>
                            <Text style={styles.tituloProcesso}>📄 Processo: <Text style={styles.valor}>{d.numeroProcesso}</Text></Text>

                            {d.orgaoJulgador && (
                                <Text style={styles.linha}>🏛️ Órgão Julgador: <Text style={styles.valor}>{d.orgaoJulgador.nome ?? d.orgaoJulgador}</Text></Text>
                            )}

                            {d.grau && (
                                <Text style={styles.linha}>📚 Grau: <Text style={styles.valor}>{d.grau}</Text></Text>
                            )}

                            {d.classeProcessual && (
                                <Text style={styles.linha}>🏷️ Classe: <Text style={styles.valor}>{d.classeProcessual}</Text></Text>
                            )}

                            {d.assunto && (
                                <Text style={styles.linha}>
                                    🧾 Assunto(s):{" "}
                                    <Text style={styles.valor}>
                                        {Array.isArray(d.assunto)
                                            ? d.assunto.map(a =>
                                                typeof a === 'object'
                                                    ? `${a?.codigo ?? ''} - ${a?.nome ?? ''}`
                                                    : String(a)).join(" | ")
                                            : typeof d.assunto === 'object'
                                                ? `${d.assunto?.codigo ?? ''} - ${d.assunto?.nome ?? ''}`
                                                : String(d.assunto)}
                                    </Text>
                                </Text>
                            )}

                            {d.dataAjuizamento && (
                                <Text style={styles.linha}>📅 Ajuizamento: <Text style={styles.valor}>{formatarData(d.dataAjuizamento)}</Text></Text>
                            )}

                            {partes && (
                                <Text style={styles.linha}>👤 Partes:\n<Text style={styles.valor}>{partes}</Text></Text>
                            )}

                            {movimentacoes && (
                                <Text style={styles.linha}>🗂️ Movimentações:\n<Text style={styles.valor}>{movimentacoes}</Text></Text>
                            )}
                        </View>
                    );
                }}

            />

            <View style={{ marginTop: 20 }}>
                <Button title="VOLTAR PARA A HOME" onPress={() => navigation.navigate('Home')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 10
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
