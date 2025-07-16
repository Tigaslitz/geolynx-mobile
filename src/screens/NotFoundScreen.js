import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';

export default function NotFound() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Página não encontrada</Text>
            <Text style={styles.message}>Desculpa, não existe a rota que procuraste.</Text>
            <Button title="Voltar ao Início" onPress={() => navigation.navigate('Home')} color={colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
    message: { fontSize: 16, marginBottom: spacing.lg, color: colors.text, textAlign: 'center' }
});