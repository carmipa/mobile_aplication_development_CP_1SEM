import React from 'react';
import Routes from './src/routes';
import ThemeProvider from './src/context/ThemeContext';
import 'react-native-gesture-handler';

// 1. Importe o StatusBar
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <ThemeProvider>
            {/* 2. Adicione o StatusBar aqui */}
            <StatusBar style="light" backgroundColor="#000000" />

            {/* Seu componente de Rotas continua aqui */}
            <Routes />
        </ThemeProvider>
    );
}