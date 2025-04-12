import { StyleSheet, Text, View, Button } from "react-native";

export default function Home({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo à Home</Text>
            <Button
                title="Ir para API"
                onPress={() => navigation.navigate('Api')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    }
});
