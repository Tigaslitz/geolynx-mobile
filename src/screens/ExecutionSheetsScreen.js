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
                <Text style={[styles.title, { color: theme.primary }]}>Minhas Operações</Text>
                {assignments.map(sheet => (
                    <TouchableOpacity
                        key={sheet.id}
                        style={[styles.card, { borderColor: theme.primary }]}
                        onPress={() => navigation.navigate('ExecutionSheetDetail', { sheet })}
                    >
                        <Text style={[styles.label, { color: theme.text }]}>Folha: {sheet.id}</Text>
                        <Text style={[styles.value, { color: theme.text }]}>De {sheet.startingDate} a {sheet.finishingDate}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: spacing.lg,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.background,
        borderWidth: 1,
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: spacing.sm,
    },
    value: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
