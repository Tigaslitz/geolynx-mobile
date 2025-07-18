import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {useUser} from "../contexts/UserContext";
import {getTheme} from "../services/GeneralFunctions";

export default async function NotFound() {
    console.log('NotFound');
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Página não encontrada</Text>
            <Text style={styles.message}>Desculpa, não existe a rota que procuraste.</Text>
            <Button title="Voltar ao Início" onPress={() => navigation.navigate('Home')} color={theme.primary}/>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: theme.background
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.sm,
        color: theme.text
    },

    message: {
        fontSize: 16,
        marginBottom: spacing.lg,
        color: theme.text,
        textAlign: 'center'
    }
});