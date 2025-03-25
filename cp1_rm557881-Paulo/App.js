import { useState } from 'react';
import { Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';

function CalculadoraPreco({ valorProduto, porcentagemAumento }) {
  const valor = parseFloat(valorProduto);
  const aumento = parseFloat(porcentagemAumento);
  const novoValor = valor + (valor * aumento) / 100;

  return (
    <View>
      <Text>O novo valor do produto será: R$ {novoValor.toFixed(2)}</Text>
    </View>
  );
}

export default function App() {
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [porcentagemAumento, setPorcentagemAumento] = useState('');
  const [mostrarDados, setMostrarDados] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://static.vecteezy.com/ti/vetor-gratis/p1/6624464-conceito-compras-com-bolsas-fundo-ilustracao-eps-10-gratis-vetor.jpg',
        }}
        style={styles.imagem}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite o nome do produto:"
        value={nomeProduto}
        onChangeText={(nome) => setNomeProduto(nome)}
      />
      <TextInput
        style={styles.input}
        placeholder="Digite o valor do produto:"
        maxLength={10}
        keyboardType="numeric"
        value={valorProduto}
        onChangeText={(valor) => setValorProduto(valor)}
      />
      <TextInput
        style={styles.input}
        placeholder="Porcentagem de aumento:"
        maxLength={10}
        keyboardType="numeric"
        value={porcentagemAumento}
        onChangeText={(valor) => setPorcentagemAumento(valor)}
      />
      <Button title="Calcular" onPress={() => setMostrarDados(true)} />
      {mostrarDados && (
        <CalculadoraPreco
          valorProduto={valorProduto}
          porcentagemAumento={porcentagemAumento}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fbd69e'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '80%',
    paddingHorizontal: 8,
    backgroundColor: "white"
  },
  imagem: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
