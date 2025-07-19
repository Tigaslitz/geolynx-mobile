import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExecutionSheets } from '../contexts/ExecutionSheetContext';
import { getTheme } from '../services/GeneralFunctions';
import { lightmode, darkmode } from '../theme/colors';
import { spacing } from '../theme';

export default function ExecutionSheetsScreen({ navigation }) {
    const { assignments, loading, error, getAssignments } = useExecutionSheets();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const mode = await getTheme();
            setTheme(mode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
        const loadAssignments = async() =>{
            await getAssignments();
        }
        loadAssignments();
    }, []);

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>Não foi possível carregar as folhas.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title]}>Minhas Operações</Text>

                {assignments.length === 0 ? (
                    <Text style={[styles.noAssignmentsText]}>
                        Ainda não tem trabalhos atribuídos
                    </Text>
                ) : (
                    assignments.map(sheet => (
                        <TouchableOpacity
                            key={sheet.id}
                            style={[styles.card, { borderColor: theme.primary }]}
                            onPress={() => navigation.navigate('ExecutionSheetDetail', { sheet })}
                        >
                            <Text style={[styles.label]}>Folha: {sheet.id}</Text>
                            <Text style={[styles.value]}>
                                De {sheet.startingDate} a {sheet.finishingDate}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
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
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.text,
        marginBottom: spacing.lg,
        textAlign: 'left',
        borderLeftWidth: 4,
        borderLeftColor: theme.primary,
        paddingLeft: spacing.md,
    },
    card: {
        backgroundColor: theme.card || theme.surface || theme.background,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 5,
        borderLeftColor: theme.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: spacing.xs,
    },
    value: {
        fontSize: 15,
        color: theme.text,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.error,
        marginTop: spacing.md,
    },
    noAssignmentsText: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.text,
        marginTop: spacing.lg,
    },
});
