// --- src/screens/FavoritosScreen.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';

export default function FavoritosScreen() {
    const [favoritos, setFavoritos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const navigation = useNavigation();
    const { currentTheme } = useThemeContext();
    const isDark = currentTheme === 'dark';
    const styles = getThemedStyles(isDark);

    // Função para carregar os favoritos
    const carregarFavoritos = async () => {
        // Não seta carregando aqui para evitar piscar na atualização pós-remoção
        try {
            const favoritosSalvos = await AsyncStorage.getItem('@favoriteProcesses');
            if (favoritosSalvos !== null) {
                const parsedFavoritos = JSON.parse(favoritosSalvos);
                parsedFavoritos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                setFavoritos(parsedFavoritos);
            } else {
                setFavoritos([]);
            }
        } catch (e) {
            console.error('Erro ao carregar favoritos na tela FavoritosScreen:', e);
            Alert.alert("Erro", "Não foi possível carregar os processos favoritos.");
            setFavoritos([]);
        } finally {
            // Seta carregando como false apenas na primeira carga
            if (carregando) setCarregando(false);
        }
    };

    // Hook useFocusEffect para recarregar quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            console.log("FavoritosScreen recebeu foco, recarregando...");
            // Seta carregando como true apenas na primeira vez que o useFocusEffect roda
            if (favoritos.length === 0) { // Ou outra lógica para detectar primeira carga
                setCarregando(true);
            }
            carregarFavoritos();
            // Função de cleanup não necessária aqui
        }, [])
    );


    // Função para remover um favorito
    const removerFavorito = async (favoritoId) => {
        Alert.alert(
            "Confirmar Remoção",
            "Tem certeza que deseja remover este processo dos favoritos?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover", style: "destructive", onPress: async () => {
                        try {
                            // Atualiza a lista local primeiro para feedback rápido
                            const novosFavoritos = favoritos.filter(fav => fav.id !== favoritoId);
                            setFavoritos(novosFavoritos);
                            // Depois atualiza o AsyncStorage
                            await AsyncStorage.setItem('@favoriteProcesses', JSON.stringify(novosFavoritos));
                            Alert.alert("Sucesso", "Processo removido dos favoritos.");
                        } catch (e) {
                            console.error('Erro ao remover favorito:', e);
                            Alert.alert("Erro", "Não foi possível remover o processo dos favoritos.");
                            // Se falhou, recarrega a lista original do storage
                            carregarFavoritos();
                        }
                    }
                }
            ]
        );
    };

    // Função para navegar para a busca com os dados do favorito
    const buscarProcessoFavorito = (item) => {
        // Navega para a ROTA que usa o componente Api.js
        // O nome da rota é 'ApiDrawer' como definido em drawer.routes.js
        navigation.navigate('ApiDrawer', {
            processo: item.numero,
            tribunal: item.tribunalUrl
        });
    };

    // Renderiza cada item da lista de favoritos
    const renderItemFavorito = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemNumero} selectable={true}>{item.numero || 'Número não disponível'}</Text>
                <Text style={styles.itemTribunal} selectable={true}>{item.tribunalNome || 'Tribunal não disponível'}</Text>
                {item.timestamp && (
                    <Text style={styles.itemTimestamp}>
                        Adicionado em: {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                    </Text>
                )}
            </View>
            <View style={styles.itemActionsContainer}>
                <Pressable onPress={() => buscarProcessoFavorito(item)} style={styles.actionButton} hitSlop={10}>
                    <MaterialCommunityIcons name="magnify" size={24} color={styles.iconColorPrimary} />
                </Pressable>
                <Pressable onPress={() => removerFavorito(item.id)} style={styles.actionButton} hitSlop={10}>
                    <Ionicons name="trash-outline" size={24} color={styles.iconColorDanger} />
                </Pressable>
            </View>
        </View>
    );

    if (carregando) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={styles.primaryColor} />
                <Text style={styles.loadingText}>Carregando Favoritos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Processos Favoritos</Text>
            {favoritos.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="star-outline" size={60} color={styles.emptyIconColor} />
                    <Text style={styles.emptyText}>Você ainda não adicionou processos aos favoritos.</Text>
                    <Text style={styles.emptySubText}>Use o ícone ⭐ na tela de busca.</Text>
                </View>
            ) : (
                <FlatList
                    data={favoritos}
                    renderItem={renderItemFavorito}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    // Extra prop para forçar re-render se a lista mudar drasticamente (opcional)
                    // extraData={favoritos.length}
                />
            )}
        </View>
    );
}

// Função de estilos dinâmicos para FavoritosScreen (igual anterior)
function getThemedStyles(isDark) {
    const backgroundColor = isDark ? '#121212' : '#f8f9fa';
    const textColor = isDark ? '#e0e0e0' : '#212529';
    const itemBackgroundColor = isDark ? '#1e1e1e' : '#ffffff';
    const borderColor = isDark ? '#444' : '#e0e0e0';
    const primaryColor = isDark ? '#66bfff' : '#007bff'; // Azul
    const dangerColor = isDark ? '#ff7f7f' : '#dc3545'; // Vermelho
    const subtleTextColor = isDark ? '#aaa' : '#6c757d'; // Cinza

    return StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor, paddingHorizontal: 15, paddingTop: 15 }, // Ajuste padding
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 }, // Padding para centralizar melhor
        titulo: { fontSize: 22, fontWeight: 'bold', color: textColor, textAlign: 'center', marginBottom: 20, },
        loadingText: { marginTop: 10, color: textColor, fontSize: 16, },
        emptyText: { fontSize: 18, color: textColor, textAlign: 'center', marginTop: 15, },
        emptySubText: { fontSize: 14, color: subtleTextColor, textAlign: 'center', marginTop: 5, },
        emptyIconColor: subtleTextColor,
        listContentContainer: { paddingBottom: 20, },
        itemContainer: { backgroundColor: itemBackgroundColor, borderRadius: 8, paddingVertical: 12, paddingLeft: 15, paddingRight: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: borderColor, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.1, shadowRadius: 1, },
        itemTextContainer: { flex: 1, marginRight: 10, },
        itemNumero: { fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 4, },
        itemTribunal: { fontSize: 14, color: subtleTextColor, marginBottom: 4, flexShrink: 1 /* Permite quebrar linha se necessário */ },
        itemTimestamp: { fontSize: 12, color: subtleTextColor, fontStyle: 'italic', },
        itemActionsContainer: { flexDirection: 'row', alignItems: 'center', },
        actionButton: { padding: 8, marginLeft: 10, }, // Área de toque e espaçamento
        iconColorPrimary: primaryColor,
        iconColorDanger: dangerColor,
        primaryColor: primaryColor,
    });
}