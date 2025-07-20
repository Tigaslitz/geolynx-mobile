// File: src/screens/UserManualScreen.js

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightmode, darkmode } from '../theme/colors';
import { getTheme } from '../services/GeneralFunctions';

export default function UserManualScreen() {
    const [theme, setTheme] = useState(lightmode);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const styles = getStyles(theme);

    // Define Section here, so it closes over styles
    const Section = ({ title, content }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionContent}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={require('../../assets/Logo_Geolynx.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Manual de Utilizador</Text>

                <Section
                    title="1. Início de Sessão"
                    content="Insira as suas credenciais fornecidas para iniciar sessão. Contacte o administrador caso não tenha acesso."
                    styles={styles}
                />
                <Section
                    title="2. Navegação Principal"
                    content="A página inicial mostra o mapa, estatísticas e atalhos rápidos para ações como criar fichas de obra ou consultar utilizadores."
                />
                <Section
                    title="3. Mapa"
                    content="O mapa pode ser visualizado em visor minimizado, ou pode ser expandido para revelar a totalidade das funcionalidades que o mapa oferece, como a visualização de entidades (animais e curiosidades históricas) e criação de entidades."
                />
                <Section
                    title="4. Criar Ficha de Obra"
                    content="Aceda ao menu 'Nova Ficha de Obra', preencha os campos obrigatórios e guarde os dados."
                />
                <Section
                    title="5. Gerir Utilizadores"
                    content="Apenas utilizadores com permissões devidas podem visualizar e gerir contas de outros utilizadores."
                />
                <Section
                    title="6. Página de Perfil"
                    content="Pode alternar entre o modo claro e escuro, pode encontrar este manual, terminar sessão, e apagar a sua conta."
                />
                <Section
                    title="7. Terminar Sessão"
                    content="Utilize o botão 'Terminar Sessão' para sair da aplicação com segurança."
                />
                <Section
                    title="8. Eliminar Conta"
                    content="Utilize o botão 'Eliminar Conta' para apagar a sua conta (Atenção: esta ação é irreversível)."
                />

                <Text style={styles.footer}>
                    Última atualização: {new Date().toLocaleDateString()}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const Section = ({ title, content, styles }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionContent}>{content}</Text>
    </View>
);

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: theme.text,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
        color: theme.primary,
    },
    sectionContent: {
        fontSize: 16,
        color: theme.text,
        lineHeight: 22,
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        color: theme.text,
        opacity: 0.6,
        fontSize: 14,
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20,

        // iOS shadow properties
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,

        // Android elevation for shadow
        elevation: 5,
    }
});
