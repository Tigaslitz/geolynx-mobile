import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWorkSheets } from '../contexts/WorkSheetContext';
import { spacing } from '../theme';
import { SafeAreaView } from "react-native-safe-area-context";
import { getTheme } from "../services/GeneralFunctions";
import { darkmode, lightmode } from "../theme/colors";

export default function WorkSheetList({ navigation }) {
    const { worksheets, fetchWorkSheets, loading } = useWorkSheets();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    useEffect(() => {
        fetchWorkSheets();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Minhas Fichas</Text>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {worksheets.map((sheet) => (
                        <TouchableOpacity
                            key={sheet.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('WorkSheet', { id: sheet.id })}
                        >
                            <Text style={styles.cardTitle}>
                                {sheet.aigp || `Ficha ${sheet.id}`}
                            </Text>
                            <Text style={styles.cardDate}>
                                {new Date(sheet.awardDate).toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    scrollContainer: {
        paddingBottom: spacing.lg,
    },
    card: {
        backgroundColor: theme.surface,
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.primary,
        marginBottom: spacing.md,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 14,
        color: theme.text,
        opacity: 0.7,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
});
