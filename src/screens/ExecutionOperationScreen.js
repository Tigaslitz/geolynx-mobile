import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme } from '../services/GeneralFunctions';
import { darkmode, lightmode } from '../theme/colors';
import { spacing } from '../theme';

export default function ExecutionOperationScreen({ route }) {
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
                <Text style={styles.title}>Operações de Execução</Text>

                {operations.map((op, idx) => (
                    <View key={idx} style={styles.card}>
                        <Text style={styles.label}>Código</Text>
                        <Text style={styles.value}>{op.operationCode}</Text>

                        <Text style={styles.label}>Área Executada (ha)</Text>
                        <Text style={styles.value}>{op.areaHaExecuted}</Text>

                        <Text style={styles.label}>Percentagem (%)</Text>
                        <Text style={styles.value}>{op.areaPerc}</Text>

                        <Text style={styles.label}>Início</Text>
                        <Text style={styles.value}>{op.startingDate}</Text>

                        <Text style={styles.label}>Fim</Text>
                        <Text style={styles.value}>{op.finishingDate}</Text>

                        <Text style={styles.label}>Planeado (até)</Text>
                        <Text style={styles.value}>{op.plannedCompletionDate}</Text>

                        <Text style={styles.label}>Duração Estimada (h)</Text>
                        <Text style={styles.value}>{op.estimatedDurationHours}</Text>

                        <Text style={styles.label}>Observações</Text>
                        <Text style={styles.value}>{op.observations || '-'}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    container: {
        padding: spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.primary,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    label: {
        fontWeight: '600',
        color: theme.text,
        marginBottom: 4,
    },
    value: {
        marginBottom: spacing.sm,
        fontSize: 16,
        color: theme.text,
    },
});
