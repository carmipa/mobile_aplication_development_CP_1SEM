// App.js
import React from 'react';
import Routes from './src/routes';
import ThemeProvider from './src/context/ThemeContext'; // ✅ Importação corrigida
import 'react-native-gesture-handler';

export default function App() {
    return (
        <ThemeProvider>
            <Routes />
        </ThemeProvider>
    );
}
