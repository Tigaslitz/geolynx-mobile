import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useWorkSheets } from '../contexts/WorkSheetContext';
import { theme, spacing } from '../theme';
import {SafeAreaView} from "react-native-safe-area-context";
import {getTheme} from "../services/GeneralFunctions";
import {darkmode, lightmode} from "../theme/colors";

export default function WorkSheetList({ navigation }) {
    const { worksheets,fetchWorkSheets, loading } = useWorkSheets();
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
        const loadWorkSheets = async () => {
            await fetchWorkSheets();
        };
        loadWorkSheets();
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
                <ScrollView vertical contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false}>
                    {worksheets.map((sheet) => (
                        <TouchableOpacity
                            key={sheet.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('WorkSheet', { id: sheet.id })}
                        >
                            <Text style={styles.cardTitle}>{sheet.aigp || `Ficha ${sheet.aigp}`}</Text>
                            <Text style={styles.cardDate}>{new Date(sheet.awardDate).toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        padding: spacing.md,
    },
    title: {
        color: theme.primary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    scrollContainer: {
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: theme.surface,
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.primary,
        marginRight: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: spacing.xs,
    },
    cardDate: {
        fontSize: 14,
        color: theme.text,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
});
