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
                        <Text style={styles.code}>{op.operationCode}</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Área Executada:</Text>
                            <Text style={styles.value}>{op.areaHaExecuted} ha</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Percentagem:</Text>
                            <Text style={styles.value}>{op.areaPerc}%</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Início:</Text>
                            <Text style={styles.value}>{op.startingDate}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Fim:</Text>
                            <Text style={styles.value}>{op.finishingDate}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Planeado (até):</Text>
                            <Text style={styles.value}>{op.plannedCompletionDate}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Duração Estimada:</Text>
                            <Text style={styles.value}>{op.estimatedDurationHours} h</Text>
                        </View>

                        <View style={[styles.row, { marginTop: spacing.sm }]}>
                            <Text style={styles.label}>Observações:</Text>
                        </View>
                        <Text style={styles.observations}>{op.observations || '-'}</Text>
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
            marginBottom: spacing.lg,
            textAlign: 'center',
        },
        card: {
            backgroundColor: theme.infoBackground || (theme === darkmode ? '#1E1E1E' : '#F0FAF4'),
            borderLeftWidth: 5,
            borderLeftColor: theme.accent || theme.primary,
            borderRadius: 12,
            padding: spacing.lg,
            marginBottom: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
        },
        code: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.primary,
            marginBottom: spacing.md,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6,
        },
        label: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '600',
        },
        value: {
            fontSize: 16,
            color: theme.text,
            fontWeight: '500',
        },
        observations: {
            fontStyle: 'italic',
            fontSize: 15,
            color: theme.text,
            marginTop: 4,
        },
    });
