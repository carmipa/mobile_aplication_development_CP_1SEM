// --- src/utils/pdfService.js ---

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// Função exportada que recebe os dados necessários como parâmetros
export const generateAndSharePdfReport = async (processosData, numeroBuscado, isDarkTheme) => {
    // Verifica se há dados para processar
    if (!processosData || processosData.length === 0) {
        Alert.alert("Sem dados", "Não há resultados para gerar o relatório.");
        return; // Sai da função se não houver dados
    }

    try {
        // --- 1. GERAR O HTML ---
        // É aqui que entra a lógica principal de formatação
        // Use os parâmetros: isDarkTheme, numeroBuscado, processosData
        let htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Relatório Processual</title>
                <style>
                    /* --- SEUS ESTILOS CSS AQUI --- */
                    body {
                        font-family: sans-serif;
                        background-color: ${isDarkTheme ? '#121212' : '#f8f9fa'};
                        color: ${isDarkTheme ? '#e0e0e0' : '#212529'};
                        padding: 20px;
                        font-size: 14px; /* Ajuste tamanho base */
                    }
                    h1 {
                         color: ${isDarkTheme ? '#bbdffd' : '#003366'};
                         text-align: center;
                         margin-bottom: 10px;
                    }
                     h2 {
                         color: ${isDarkTheme ? '#aaaaaa' : '#6c757d'};
                         text-align: center;
                         font-size: 1.1em;
                         margin-bottom: 20px;
                         font-weight: normal;
                     }
                    .processo-item {
                        background-color: ${isDarkTheme ? '#1e1e1e' : '#ffffff'};
                        border-left: 5px solid ${isDarkTheme ? '#66bfff' : '#007bff'};
                        padding: 15px;
                        margin-bottom: 20px;
                        border-radius: 5px;
                        box-shadow: 2px 2px 5px rgba(0,0,0,0.1); /* Sombra suave */
                    }
                    .titulo-processo {
                        color: ${isDarkTheme ? '#bbdffd' : '#003366'};
                        font-weight: bold;
                        font-size: 1.1em;
                        margin-bottom: 10px;
                    }
                    .linha {
                        margin-bottom: 5px;
                        line-height: 1.5;
                    }
                    .label { /* Estilo para os rótulos como "🏛️ Tribunal:" */
                        font-weight: bold;
                         color: ${isDarkTheme ? '#e0e0e0' : '#212529'};
                    }
                    .valor { /* Estilo para os valores */
                        color: ${isDarkTheme ? '#cccccc' : '#343a40'};
                    }
                    .movimentacoes-titulo {
                         font-weight: bold;
                         margin-top: 15px;
                         margin-bottom: 5px;
                     }
                    .movimentacao-item {
                        font-size: 0.9em; /* Movimentos um pouco menores */
                        margin-bottom: 4px;
                        padding-left: 10px; /* Leve indentação */
                        border-left: 2px solid #ccc; /* Linha sutil à esquerda */
                        color: ${isDarkTheme ? '#cccccc' : '#343a40'};
                    }
                    hr {
                         border: 0;
                         height: 1px;
                         background-color: ${isDarkTheme ? '#444' : '#ced4da'};
                         margin: 20px 0;
                     }
                    /* Adicione mais classes e estilos conforme precisar */
                </style>
            </head>
            <body>
                <h1>Relatório da Consulta Processual</h1>
                <h2>Número Buscado: ${numeroBuscado || 'N/D'}</h2>
                <hr>
        `;

        // Loop para formatar cada processo em HTML
        processosData.forEach((item) => {
            const d = item._source || {};
            const dadosBasicos = d.dadosBasicos || {}; // Pega dadosBasicos se existir

            // --- LÓGICA DE FORMATAÇÃO DETALHADA (ADAPTADA DO SEU RENDER ITEM PARA HTML) ---
            // (Esta parte precisará de atenção para converter JSX/Text para HTML/CSS)

            // Exemplo de como começar a converter:
            const numeroProcesso = d.numeroProcesso || 'N/D';
            const tribunal = d.tribunal || 'N/D';
            const grau = d.grau || 'N/D';
            // Recupere e formate todas as outras variáveis como você fez no renderItem...
            const sigiloMap = { 0: 'Público', 1: 'Segredo de Justiça', 2: 'Sigilo Mínimo', 3: 'Sigilo Médio', 4: 'Sigilo Intenso', 5: 'Sigilo Absoluto' };
            const nivelSigiloTexto = sigiloMap[dadosBasicos.nivelSigilo ?? d.nivelSigilo ?? -1] || 'Não informado';
            const classeNome = d.classe?.nome || 'N/D';
            const classeCodigo = d.classe?.codigo;
            const orgaoTexto = d.orgaoJulgador?.nome || dadosBasicos.orgaoJulgador?.nome || 'N/D';
            const orgaoCodigo = d.orgaoJulgador?.codigo;
            // Função auxiliar (pode até movê-la para utils se usada em mais lugares)
            const formatarDataHTML = (dataStr) => {
                if (!dataStr) return "Não informada";
                try { const date = new Date(dataStr); return isNaN(date.getTime()) ? dataStr : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); } catch { return dataStr; }
            };
            const dataAjuizamento = formatarDataHTML(d.dataAjuizamento);
            const valorCausaNum = dadosBasicos.valorCausa ?? d.valorCausa;
            const valorCausaTexto = typeof valorCausaNum === 'number' ? valorCausaNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/I';
            const custas = dadosBasicos.custasRecolhidas;
            const prioridades = Array.isArray(dadosBasicos.tipoPrioridade) ? dadosBasicos.tipoPrioridade.join(', ') : (dadosBasicos.tipoPrioridade || '');
            const juizo100 = dadosBasicos.juizo100Digital;
            const assuntosTexto = (Array.isArray(d.assuntos) && d.assuntos.length > 0 ? d.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigo || '?'})`).join(' | ') : (Array.isArray(dadosBasicos.assuntos) && dadosBasicos.assuntos.length > 0 ? dadosBasicos.assuntos.map(a => `${a.nome || 'Assunto'} (${a.codigoNacional || a.codigo || '?'})`).join(' | ') : 'Não informado'));

            // Partes (Exemplo simplificado, pode detalhar mais)
            const partesArray = d.partes || dadosBasicos.polo?.flatMap(p => p.parte || []);
            const partesHtml = Array.isArray(partesArray) ? partesArray.map(pt => { const nome = pt.nome || pt.pessoa?.nome || pt.interessePublico || 'Parte Desconhecida'; const polo = pt.polo?.sigla || pt.polo || dadosBasicos.polo?.find(pol => pol.parte?.some(pa => (pa.pessoa?.nome || pa.interessePublico) === nome))?.polo || '?'; return `<p class='linha'><span class='label'>(${polo}):</span> <span class='valor'>${nome}</span></p>`; }).join('') : '<p class="valor">Partes não informadas</p>';

            // Movimentos (Exemplo simplificado)
            const movimentosArray = d.movimentos || d.movimento;
            const movimentacoesHtml = Array.isArray(movimentosArray) && movimentosArray.length > 0 ? movimentosArray.slice(0, 15).map(m => { const data = formatarDataHTML(m.dataHora); const nomeMovimento = m.nome || m.movimentoNacional?.descricao || m.movimentoLocal?.descricao || 'Movimento não descrito'; return `<div class="movimentacao-item">${data}: ${nomeMovimento}</div>`; }).join('') + (movimentosArray.length > 15 ? '<div class="movimentacao-item">... (mais movimentos omitidos)</div>' : '') : '<p class="valor">Sem movimentações registradas.</p>';


            // Monta o HTML para este item
            htmlContent += `
                <div class="processo-item">
                    <p class="titulo-processo">📄 Processo: <span class="valor">${numeroProcesso}</span></p>
                    <p class="linha"><span class="label">🏛️ Tribunal:</span> <span class="valor">${tribunal}</span> | <span class="label">Grau:</span> <span class="valor">${grau}</span> | <span class="label">Sigilo:</span> <span class="valor">${nivelSigiloTexto}</span></p>
                    <p class="linha"><span class="label">🏷️ Classe:</span> <span class="valor">${classeCodigo ? `(${classeCodigo}) ` : ''}${classeNome}</span></p>
                    <p class="linha"><span class="label">📍 Órgão Julgador:</span> <span class="valor">${orgaoTexto}${orgaoCodigo ? ` (${orgaoCodigo})` : ''}</span></p>
                    <p class="linha"><span class="label">📅 Ajuizamento:</span> <span class="valor">${dataAjuizamento}</span></p>
                    <p class="linha"><span class="label">💰 Valor Causa:</span> <span class="valor">${valorCausaTexto}</span></p>
                    ${(custas !== undefined && custas !== null) ? `<p class="linha"><span class="label">💲 Custas Recolhidas:</span> <span class="valor">${custas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>` : ''}
                    ${prioridades ? `<p class="linha"><span class="label">🚩 Prioridade(s):</span> <span class="valor">${prioridades}</span></p>` : ''}
                    ${(juizo100 === true || juizo100 === false) ? `<p class="linha"><span class="label">💻 Juízo 100% Digital:</span> <span class="valor">${juizo100 ? 'Sim' : 'Não'}</span></p>` : ''}
                    <p class="linha" style="margin-top: 10px;"><span class="label">🧾 Assunto(s):</span> <span class="valor">${assuntosTexto}</span></p>
                     <div style="margin-top: 10px;"><span class="label">👤 Partes:</span> ${partesHtml}</div>
                     <div class="movimentacoes-titulo">🗂️ Movimentações (Últimas 15):</div>
                     ${movimentacoesHtml}
                </div>
            `;
        }); // Fim do loop forEach

        htmlContent += `</body></html>`;
        // --- FIM DA GERAÇÃO DO HTML ---

        // --- 2. CONVERTER PARA PDF ---
        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false // Gera um arquivo em vez de string base64
        });
        console.log('PDF gerado em:', uri);

        // --- 3. COMPARTILHAR O PDF ---
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo.');
            return;
        }
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartilhar Relatório PDF do Processo', // Título da janela de compartilhamento
            UTI: 'com.adobe.pdf' // Identificador para iOS saber que é PDF
        });

    } catch (error) {
        Alert.alert('Erro ao Gerar PDF', `Ocorreu um erro inesperado: ${error.message}`);
        console.error("Erro ao gerar/compartilhar PDF:", error);
    }
    // Não precisa de finally para setLoading se não o recebeu como parâmetro
};