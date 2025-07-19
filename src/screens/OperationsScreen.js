import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme } from '../services/GeneralFunctions';
import { darkmode, lightmode } from '../theme/colors';
import { spacing } from '../theme';

export default function OperationsScreen({ route }) {
    const { operations } = route.params;
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Operações</Text>

                {operations.map((op, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Código</Text>
                            <Text style={styles.value}>{op.operationCode}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Descrição</Text>
                            <Text style={styles.value}>{op.operationDescription}</Text>
                        </View>
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Área (ha)</Text>
                            <Text style={styles.value}>{op.areaHa}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.background,
        },
        container: {
            padding: spacing.lg,
        },
        title: {
            fontSize: 26,
            fontWeight: '800',
            color: theme.primary,
            marginBottom: spacing.xl,
            textAlign: 'center',
            borderBottomWidth: 2,
            borderBottomColor: theme.primary,
            paddingBottom: spacing.sm,
        },
        card: {
            backgroundColor: theme.infoBackground || theme.surface,
            borderRadius: 12,
            padding: spacing.md,
            marginBottom: spacing.md,
            shadowColor: theme.cardShadow || '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
        },
        infoBlock: {
            marginBottom: spacing.md,
        },
        label: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.primary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 2,
        },
        value: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
    });
