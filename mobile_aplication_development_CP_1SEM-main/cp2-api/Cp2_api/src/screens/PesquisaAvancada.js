import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    Keyboard,
    SectionList,
    useColorScheme,
    ScrollView, // Necessário para filtros E movimentações
    TouchableOpacity,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

// --- Componente Separado para a Lista de Resultados ---
const RenderSectionList = ({
                               dados,
                               styles,
                               formatarData,
                               ListEmptyComponent, // Prop adicionada
                               ListFooterComponent // Prop adicionada
                           }) => (
    <SectionList
        style={styles.resultsList} // Aplicar estilo da lista aqui
        sections={dados}
        keyExtractor={(item, index) => item._id || `resultado-${index}`}
        renderItem={({ item }) => {
            // Lógica interna do renderItem mantida
            const d = item._source || item;
            const dadosBasicos = d.dadosBasicos || {};
            const numeroProcesso = dadosBasicos.numeroProcesso || d.numeroProcesso || 'Não informado';
            const siglaTribunal = dadosBasicos.siglaTribunal || '';
            const grau = dadosBasicos.grau || '';
            const classeNome = d.classe?.nome || '';
            const dataAjuizamento = d.dataAjuizamento;
            const assuntos = d.assuntos || [];
            const movimentos = d.movimentos || [];
            const partes = d.partes || [];
            const advogados = d.advogados || []; // Ajustar se advogados estiverem dentro de 'partes' na API

            const displayNumeroProcesso = String(numeroProcesso);
            const displaySiglaTribunal = String(siglaTribunal);
            const displayGrau = String(grau);
            const displayClasseNome = String(classeNome);
            const displayDataAjuizamento = formatarData(dataAjuizamento);
            const displayAssuntos = Array.isArray(assuntos) ? assuntos.map(a => String(a.nome || '')).join(" | ") : '';

            return (
                <View style={styles.item}>
                    <Text style={styles.tituloProcesso}>
                        {'📄 '}
                        <Text style={styles.itemValueStrong}>{displayNumeroProcesso}</Text>
                    </Text>

                    {(siglaTribunal || grau) && (
                        <View style={styles.itemRow}>
                            {siglaTribunal ? (
                                <Text style={styles.itemDetail}>
                                    <Text style={styles.itemLabel}>🏛️ Tribunal: </Text>
                                    <Text style={styles.itemValue}>{displaySiglaTribunal}</Text>
                                </Text>
                            ) : null}
                            {grau ? (
                                <Text style={styles.itemDetail}>
                                    <Text style={styles.itemLabel}>📚 Grau: </Text>
                                    <Text style={styles.itemValue}>{displayGrau}</Text>
                                </Text>
                            ) : null}
                        </View>
                    )}

                    {classeNome ? (
                        <Text style={styles.itemDetail}>
                            <Text style={styles.itemLabel}>🏷️ Classe: </Text>
                            <Text style={styles.itemValue}>{displayClasseNome}</Text>
                        </Text>
                    ) : null}

                    {dataAjuizamento ? (
                        <Text style={styles.itemDetail}>
                            <Text style={styles.itemLabel}>📅 Ajuizamento: </Text>
                            <Text style={styles.itemValue}>{displayDataAjuizamento}</Text>
                        </Text>
                    ) : null}

                    {displayAssuntos ? (
                        <Text style={styles.itemDetail}>
                            <Text style={styles.itemLabel}>🧾 Assunto(s): </Text>
                            <Text style={styles.itemValue}>{displayAssuntos}</Text>
                        </Text>
                    ) : null}

                    {Array.isArray(partes) && partes.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.itemLabel}>👤 Partes:</Text>
                            {partes.slice(0, 3).map((parte, index) => (
                                <Text key={`parte-${index}`} style={styles.itemSubValue}>
                                    {`- ${String(parte.nome || '')} (${String(parte.tipoQualificacao || 'N/A')})`}
                                </Text>
                            ))}
                            {partes.length > 3 && (
                                <Text style={styles.itemSubValue}>
                                    {`- ...e mais ${partes.length - 3}`}
                                </Text>
                            )}
                        </View>
                    )}

                    {Array.isArray(advogados) && advogados.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.itemLabel}>⚖️ Advogados:</Text>
                            {advogados.slice(0, 3).map((advogado, index) => (
                                <Text key={`adv-${index}`} style={styles.itemSubValue}>
                                    {`- ${String(advogado.nome || '')} (OAB: ${String(advogado.oab || 'N/A')})`}
                                </Text>
                            ))}
                            {advogados.length > 3 && (
                                <Text style={styles.itemSubValue}>
                                    {`- ...e mais ${advogados.length - 3}`}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Seção de Movimentações com Scroll Aninhado */}
                    {Array.isArray(movimentos) && movimentos.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.itemLabel}>🗂️ Movimentações:</Text>
                            <ScrollView
                                style={styles.movimentosScrollView}
                                nestedScrollEnabled={true} // Importante para Android
                            >
                                {movimentos.map((m, index) => (
                                    <Text key={`mov-${index}`} style={styles.itemSubValueSmall}>
                                        {`${formatarData(m.dataHora)}: ${String(m.nome || "Sem descrição")}`}
                                    </Text>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View> // Fim do item View
            );
        }}
        renderSectionHeader={({ section: { title } }) => (
            // Usar os estilos corretos definidos no componente pai
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderTextContent}>{String(title)}</Text>
            </View>
        )}
        stickySectionHeadersEnabled={true} // Mantido como padrão, pode ser prop se necessário
        ListEmptyComponent={ListEmptyComponent} // Recebe o componente via prop
        ListFooterComponent={ListFooterComponent} // Recebe o componente via prop
    />
);
// --- Fim do Componente Separado ---

// --- Componente Principal ---
export default function PesquisaAvancada({ navigation }) {
    // --- Estados ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('numeroProcesso');
    const [dados, setDados] = useState([]); // Dados brutos da API
    const [carregando, setCarregando] = useState(false);
    const [tipoJusticaSelecionado, setTipoJusticaSelecionado] = useState('');
    const [tribunalSelecionado, setTribunalSelecionado] = useState('');
    const [tribunaisFiltrados, setTribunaisFiltrados] = useState([]);
    const [grauSelecionado, setGrauSelecionado] = useState('');
    const [ultimaPaginacao, setUltimaPaginacao] = useState(null);
    const [dadosOrganizados, setDadosOrganizados] = useState([]); // Dados formatados para SectionList
    const [dataAjuizamentoInicial, setDataAjuizamentoInicial] = useState('');
    const [dataAjuizamentoFinal, setDataAjuizamentoFinal] = useState('');
    const [assuntoFiltro, setAssuntoFiltro] = useState('');
    const [exibindoResultados, setExibindoResultados] = useState(false);

    // --- Tema ---
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const themeColors = {
        background: isDark ? '#121212' : '#f8f9fa',
        text: isDark ? '#e0e0e0' : '#212529',
        placeholder: isDark ? '#888' : '#6c757d',
        inputBorder: isDark ? '#555' : '#ced4da',
        inputBackground: isDark ? '#333' : '#fff',
        primary: isDark ? '#3949ab' : '#007bff',
        primaryText: isDark ? '#e8eaf6' : '#fff',
        secondaryButton: isDark ? '#555' : '#6c757d',
        secondaryButtonText: isDark ? '#e0e0e0' : '#fff',
        itemBg: isDark ? '#1e1e1e' : '#fff',
        itemBorder: isDark ? '#333' : '#e0e0e0',
        itemTitle: isDark ? '#c5cae9' : '#003366',
        itemValue: isDark ? '#ccc' : '#333',
        sectionHeaderBg: isDark ? '#2a2a2a' : '#e9ecef', // Estilo da View do Header
        sectionHeaderText: isDark ? '#c5cae9' : '#495057', // Estilo do Texto do Header
        overlayHeaderBg: isDark ? '#1f1f1f' : '#f1f3f5',
    };

    // --- Constantes de Dados (Pickers) ---
    const tiposJustica = [ { label: 'Tribunais Superiores', value: 'Superior' }, { label: 'Justiça Federal', value: 'Federal' }, { label: 'Justiça Estadual', value: 'Estadual' }, { label: 'Justiça do Trabalho', value: 'Trabalho' }, { label: 'Justiça Eleitoral', value: 'Eleitoral' }, { label: 'Justiça Militar', value: 'Militar' } ];
    const graus = [ { label: 'Todos os Graus', value: '' }, { label: '1º Grau', value: '1' }, { label: '2º Grau', value: '2' } ];
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
        { nome: 'Tribunal de Justiça Militar de São Paulo - TJM-SP', url: 'api_publica_tjmsp', tipo: 'Militar' }
    ];

    // --- useEffects ---
    useEffect(() => {
        const filtered = tribunais.filter(t => t.tipo === tipoJusticaSelecionado && t.url !== '');
        const tribunaisParaExibir = filtered.length > 0
            ? [{ nome: 'Selecione um tribunal', url: '', tipo: tipoJusticaSelecionado }, ...filtered]
            : [{ nome: 'Nenhum tribunal encontrado', url: '', tipo: tipoJusticaSelecionado }];
        if (!tipoJusticaSelecionado) { setTribunaisFiltrados([{ nome: 'Selecione o tipo de justiça', url: '', tipo: '' }]); }
        else { setTribunaisFiltrados(tribunaisParaExibir); }
        setTribunalSelecionado('');
    }, [tipoJusticaSelecionado]);

    useEffect(() => {
        const organized = [];
        dados.forEach(item => {
            const d = item._source || item; const dadosBasicos = d.dadosBasicos || {};
            const siglaTribunal = dadosBasicos.siglaTribunal || 'Outros';
            const anoAjuizamento = dadosBasicos.dataAjuizamento ? dadosBasicos.dataAjuizamento.substring(0, 4) : 'Ano não informado';
            const groupKey = `${siglaTribunal} - ${anoAjuizamento}`;
            let section = organized.find(s => s.title === groupKey);
            if (!section) { section = { title: groupKey, data: [] }; organized.push(section); }
            section.data.push(item);
        });
        organized.sort((a, b) => a.title.localeCompare(b.title));
        setDadosOrganizados(organized);
    }, [dados]);

    // --- Funções ---
    const limparTela = () => {
        Keyboard.dismiss(); setSearchTerm(''); setDados([]); setTipoJusticaSelecionado(''); setTribunalSelecionado('');
        setGrauSelecionado(''); setTribunaisFiltrados([{ nome: 'Selecione o tipo de justiça', url: '', tipo: '' }]);
        setUltimaPaginacao(null); setSearchType('numeroProcesso'); setDadosOrganizados([]);
        setDataAjuizamentoInicial(''); setDataAjuizamentoFinal(''); setAssuntoFiltro('');
        setExibindoResultados(false);
    };

    const buscarDados = async () => {
        Keyboard.dismiss();
        if (!searchTerm.trim() && searchType !== 'numeroProcesso') { Alert.alert('Erro', 'Digite o termo de busca.'); return; }
        if (!tipoJusticaSelecionado) { Alert.alert('Erro', 'Selecione o tipo de justiça.'); return; }
        if (!tribunalSelecionado) { Alert.alert('Erro', 'Selecione um tribunal.'); return; }
        setCarregando(true); setDados([]); setDadosOrganizados([]); setExibindoResultados(false);
        try {
            const url = `https://api-publica.datajud.cnj.jus.br/${tribunalSelecionado}/_search`;
            let query = { size: 10, query: { bool: { must: [] } }, sort: [{ '@timestamp': { order: 'asc' } }] };
            switch (searchType) {
                case 'numeroProcesso': if(searchTerm.trim()) query.query.bool.must.push({ match: { numeroProcesso: searchTerm.trim() } }); break;
                case 'oab': { if (!searchTerm.trim()) { Alert.alert('Erro', 'Digite a OAB.'); setCarregando(false); return; } let oabFormatada = searchTerm.trim().replace(/[^0-9A-Za-z]/g, ''); if (/^[A-Za-z]{2}\d+[A-Za-z]?$/.test(oabFormatada)) { query.query.bool.must.push({ match: { 'partes.advogado.inscricao': oabFormatada } }); } else { Alert.alert('Erro', 'Formato de OAB inválido.'); setCarregando(false); return; } break; }
                case 'nomeParte': if (!searchTerm.trim()) { Alert.alert('Erro', 'Digite o nome da parte.'); setCarregando(false); return; } query.query.bool.must.push({ match: { 'partes.nome': searchTerm.trim() } }); break;
                case 'documentoParte': { if (!searchTerm.trim()) { Alert.alert('Erro', 'Digite o CPF/CNPJ.'); setCarregando(false); return; } const documentoFormatado = searchTerm.replace(/[^0-9]/g, ''); const tipoDocumento = documentoFormatado.length === 11 ? 'cpf' : documentoFormatado.length === 14 ? 'cnpj' : null; if (tipoDocumento) { query.query.bool.must.push({ match: { [`partes.${tipoDocumento}`]: documentoFormatado } }); } else { Alert.alert('Erro', 'Formato de CPF/CNPJ inválido.'); setCarregando(false); return; } break; }
                default: Alert.alert('Erro Interno', 'Tipo de busca inválido.'); setCarregando(false); return;
            }
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dataAjuizamentoInicial && dataAjuizamentoFinal) { if (!dateRegex.test(dataAjuizamentoInicial) || !dateRegex.test(dataAjuizamentoFinal)) { Alert.alert('Erro', 'Formato de data inválido. Use AAAA-MM-DD.'); setCarregando(false); return;} if (new Date(dataAjuizamentoInicial) > new Date(dataAjuizamentoFinal)) { Alert.alert('Erro', 'A data inicial não pode ser maior que a data final.'); setCarregando(false); return; } query.query.bool.must.push({ range: { dataAjuizamento: { gte: dataAjuizamentoInicial, lte: dataAjuizamentoFinal, format: "yyyy-MM-dd" } } }); }
            else if (dataAjuizamentoInicial || dataAjuizamentoFinal) { Alert.alert('Aviso', 'Forneça ambas as datas (Inicial e Final) para filtrar por período.'); }
            if (assuntoFiltro.trim()) { query.query.bool.must.push({ match: { 'assuntos.nome': assuntoFiltro.trim() } }); }
            if (grauSelecionado) { query.query.bool.must.push({ match: { grau: grauSelecionado } }); }
            console.log('URL da API:', url); console.log('Query da API:', JSON.stringify(query, null, 2));
            let resposta;
            try {
                resposta = await axios.post(url, query, { headers: { Authorization: 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==', 'Content-Type': 'application/json' } });
                console.log('Resposta da API:', resposta.data);
                const novosDados = resposta.data?.hits?.hits;
                if (novosDados && novosDados.length > 0) { setDados(novosDados); setUltimaPaginacao(resposta.data.hits); setExibindoResultados(true); }
                else { setDados([]); Alert.alert('Nada encontrado', 'Nenhuma informação encontrada para sua busca.'); setExibindoResultados(false); }
            } catch (erro) { Alert.alert('Erro', 'Falha na busca.'); console.error('Erro da API:', erro.response?.data || erro.message); setDados([]); setExibindoResultados(false); }
            finally { setCarregando(false); }
        } catch (erro) { console.error('Erro inesperado:', erro); setCarregando(false); setExibindoResultados(false); }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return 'Não informada';
        try {
            const date = new Date(dataStr);
            if (isNaN(date.getTime())) { if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) { const parts = dataStr.split('-'); const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])); if (!isNaN(utcDate.getTime())) { return utcDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } } return dataStr; }
            return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch { return dataStr; }
    };

    // --- Componente para Lista Vazia ---
    const renderListaVazia = () => (
        <Text style={styles.emptyListText}>
            Nenhum dado para exibir nesta seção.
        </Text>
    );

    // --- Componente para Footer (Espaçador) ---
    const renderListFooter = () => (
        <View style={{ height: 20 }} />
    );

    const styles = createThemedStyles(themeColors);

    // --- Renderização do Componente Principal ---
    return (
        <SafeAreaView style={styles.safeArea}>

            {/* View dos Filtros */}
            <ScrollView
                style={styles.filtersViewMaybeScroll}
                contentContainerStyle={styles.filtersContentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.titulo}>Pesquisa Avançada</Text>

                <Text style={styles.label}>Buscar por:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={searchType}
                        onValueChange={itemValue => setSearchType(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={themeColors.placeholder}
                        enabled={!carregando}
                    >
                        <Picker.Item label="Número do Processo" value="numeroProcesso" />
                        <Picker.Item label="OAB do Advogado" value="oab" />
                        <Picker.Item label="Nome da Parte" value="nomeParte" />
                        <Picker.Item label="CPF/CNPJ da Parte" value="documentoParte" />
                    </Picker>
                </View>

                <Text style={styles.label}>Termo de Busca:</Text>
                <TextInput
                    style={styles.input}
                    placeholder={`Digite ${searchType === 'numeroProcesso' ? 'o número' : searchType === 'oab' ? 'a OAB' : searchType === 'nomeParte' ? 'o nome' : 'o CPF/CNPJ'}...`}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    keyboardType={searchType === 'numeroProcesso' || searchType === 'documentoParte' ? 'numeric' : 'default'}
                    placeholderTextColor={themeColors.placeholder}
                    editable={!carregando}
                />

                <Text style={styles.label}>Data Ajuizamento Inicial:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="AAAA-MM-DD"
                    value={dataAjuizamentoInicial}
                    onChangeText={setDataAjuizamentoInicial}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor={themeColors.placeholder}
                    editable={!carregando}
                />

                <Text style={styles.label}>Data Ajuizamento Final:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="AAAA-MM-DD"
                    value={dataAjuizamentoFinal}
                    onChangeText={setDataAjuizamentoFinal}
                    keyboardType="numeric"
                    maxLength={10}
                    placeholderTextColor={themeColors.placeholder}
                    editable={!carregando}
                />

                <Text style={styles.label}>Assunto:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o assunto..."
                    value={assuntoFiltro}
                    onChangeText={setAssuntoFiltro}
                    placeholderTextColor={themeColors.placeholder}
                    editable={!carregando}
                />

                <Text style={styles.label}>Tipo de Justiça:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tipoJusticaSelecionado}
                        onValueChange={itemValue => setTipoJusticaSelecionado(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={themeColors.placeholder}
                        enabled={!carregando}
                    >
                        <Picker.Item label="-- Selecione --" value="" />
                        {tiposJustica.map((tipo, i) => (
                            <Picker.Item key={i} label={tipo.label} value={tipo.value} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Tribunal:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tribunalSelecionado}
                        onValueChange={v => setTribunalSelecionado(v)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        enabled={!!tipoJusticaSelecionado && !carregando}
                        dropdownIconColor={themeColors.placeholder}
                    >
                        {tribunaisFiltrados.map((tribunal, i) => (
                            <Picker.Item key={i} label={tribunal.nome} value={tribunal.url} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Grau (Opcional):</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={grauSelecionado}
                        onValueChange={v => setGrauSelecionado(v)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        dropdownIconColor={themeColors.placeholder}
                        enabled={!carregando}
                    >
                        {graus.map((grau, i) => (
                            <Picker.Item key={i} label={grau.label} value={grau.value} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={limparTela}
                        disabled={carregando}
                    >
                        <Text style={styles.clearButtonText}>Limpar</Text>
                    </TouchableOpacity>
                    <View style={styles.searchButtonWrapper}>
                        <Button
                            title="Buscar"
                            onPress={buscarDados}
                            disabled={carregando}
                            color={themeColors.primary}
                        />
                    </View>
                </View>

                {carregando && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                        <Text style={styles.loadingText}>Buscando...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Camada de Resultados */}
            {exibindoResultados && (
                <View style={styles.resultsOverlay}>
                    <View style={styles.overlayHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setExibindoResultados(false)}
                        >
                            <Text style={styles.backButtonText}>{'< Voltar'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.overlayTitle}>Resultados</Text>
                        <View style={{ width: 60 }} /> {/* Espaçador */}
                    </View>

                    {/* Usando o componente extraído RenderSectionList */}
                    <RenderSectionList
                        dados={dadosOrganizados}
                        styles={styles}
                        formatarData={formatarData}
                        ListEmptyComponent={renderListaVazia} // Passando a função
                        ListFooterComponent={renderListFooter} // Passando a função
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

// --- Estilos ---
const createThemedStyles = (colors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filtersViewMaybeScroll: {
        /* Estilo para o container dos filtros. Pode ser vazio se não precisar de flex */
    },
    filtersContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginVertical: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
        color: colors.text,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 9,
        borderRadius: 6,
        marginBottom: 15,
        fontSize: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
        borderRadius: 6,
        marginBottom: 15,
        justifyContent: 'center',
    },
    picker: {
        color: colors.text,
        height: Platform.OS === 'ios' ? undefined : 50,
        width: '100%',
    },
    pickerItem: {
        color: colors.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: colors.secondaryButton,
        marginRight: 10,
    },
    clearButtonText: {
        color: colors.secondaryButtonText,
        fontSize: 15,
        fontWeight: '500',
    },
    searchButtonWrapper: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 15,
        color: colors.placeholder,
    },
    resultsOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        zIndex: 10,
        flexDirection: 'column',
    },
    overlayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.inputBorder,
        backgroundColor: colors.overlayHeaderBg,
        minHeight: Platform.OS === 'ios' ? 50 : 55,
        paddingTop: Platform.OS === 'ios' ? 5 : 0,
    },
    backButton: {
        padding: 10,
        justifyContent: 'center',
        minWidth: 60,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
    },
    overlayTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginHorizontal: 5,
    },
    resultsList: {
        flex: 1,
    },
    item: {
        backgroundColor: colors.itemBg,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.itemBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    tituloProcesso: {
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 10,
        color: colors.itemTitle,
    },
    itemRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    itemDetail: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 6,
        marginRight: 15,
        lineHeight: 20,
    },
    itemLabel: {
        fontWeight: '600',
        color: colors.placeholder,
    },
    itemValue: {
        fontWeight: '500',
        color: colors.itemValue,
    },
    itemValueStrong: {
        fontWeight: 'bold',
        color: colors.itemValue,
    },
    subSection: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.itemBorder,
    },
    itemSubValue: {
        fontSize: 13,
        color: colors.itemValue,
        marginLeft: 10,
        lineHeight: 18,
        marginBottom: 2,
    },
    itemSubValueSmall: {
        fontSize: 12,
        color: colors.placeholder,
        marginLeft: 10,
        lineHeight: 16,
        marginBottom: 2,
    },
    movimentosScrollView: {
        maxHeight: 150, // Altura máxima antes de rolar
        marginTop: 5,
        paddingVertical: 5,
    },
    // Estilo para o container do cabeçalho da seção
    sectionHeaderContainer: {
        backgroundColor: colors.sectionHeaderBg,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.itemBorder,
    },
    // Estilo para o texto dentro do cabeçalho da seção
    sectionHeaderTextContent: {
        fontWeight: 'bold',
        fontSize: 16,
        color: colors.sectionHeaderText,
    },
    emptyListText: {
        padding: 20,
        textAlign: 'center',
        color: colors.placeholder,
        fontSize: 16,
    },
});