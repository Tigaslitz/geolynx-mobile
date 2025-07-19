import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useExecutionSheets } from '../contexts/ExecutionSheetContext';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";
import {spacing} from "../theme";
import {SafeAreaView} from "react-native-safe-area-context";

const FIELD_LABELS = {
    id: 'ID da Folha de Execução',
    workSheetId: 'ID da Folha de Obra',
    startingDate: 'Data de Início',
    finishingDate: 'Data de Fim',
    lastActivityDate: 'Última Atividade',
    observations: 'Observações',
    operations: 'Operações',
    polygonsOperations: 'Operações ao Terreno'
};

export default function ExecutionSheetDetailScreen({route, navigation }) {
    const { sheet } = route.params;
    const { startActivity, loading: sheetsLoading,} = useExecutionSheets();

    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);


    useEffect(() => {
        const loadTheme = async () => {
            const mode = await getTheme();
            setTheme(mode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);


    if (sheetsLoading || !sheet) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    const { operations = [], polygonsOperations = [], ...otherFields } = sheet;
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Folha {sheet.id}</Text>

                {Object.entries(otherFields).map(([key, value]) => (
                    <View key={key} style={styles.infoBlock}>
                        <Text style={styles.label}>{FIELD_LABELS[key] || key}</Text>
                        <Text style={styles.value}>{String(value)}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.listButton]}
                    onPress={() => navigation.navigate('ExecutionOperation', { operations })}
                >
                    <Text style={styles.buttonText}>Mais Detalhes ({operations.length})</Text>
                </TouchableOpacity>

                {/* Dropdown de Operações por Polígono */}
                <View style={{marginTop: spacing.md}}>
                    <TouchableOpacity
                        style={styles.listButtonPolygon}
                        onPress={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <Text style={styles.buttonText}>
                            Operações por Polígono ({polygonsOperations.length}) {dropdownOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>
                    {dropdownOpen && (
                        <View style={styles.dropdownContainer}>
                            {polygonsOperations.map((polygonOperation, idx) => {
                                // Pega o status da primeira operação (ajuste se necessário)
                                const status = polygonOperation.operations?.[0]?.status || 'unassigned';
                                let bgColor = theme.secondary;
                                if (status === 'unassigned') bgColor = '#2196F3'; // azul
                                else if (status === 'assigned') bgColor = '#FF9800'; // laranja
                                else if (status === 'ongoing') bgColor = '#FFEB3B'; // amarelo
                                else if (status === 'completed') bgColor = '#4CAF50'; // verde

                                return (
                                    <TouchableOpacity
                                        key={polygonOperation.polygonId || idx}
                                        style={[styles.dropdownItem, { backgroundColor: bgColor }]}
                                        onPress={() =>
                                            navigation.navigate('PolygonOperation', {
                                                polygonOperation,
                                                executionSheetId: sheet.id
                                            })
                                        }
                                    >
                                        <Text style={styles.dropdownText}>
                                            ID do Polígono: {polygonOperation.polygonId}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.primary,
            marginBottom: spacing.lg,
            textAlign: 'center',
        },
        infoBlock: {
            marginBottom: spacing.md,
            borderColor: theme.primary,
            borderRadius: 8,
            borderWidth: 1,
            padding: spacing.sm,
        },
        label: {
            fontWeight: '800',
            fontSize: 15,
            color: theme.text,
            marginBottom: 4,
        },
        value: {
            color: theme.text,
            fontSize: 16,
        },
        listButton: {
            marginTop: spacing.md,
            backgroundColor: theme.secondary ,
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        listButtonPolygon: {
            marginTop: spacing.md,
            backgroundColor: theme.primary ,
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: theme.white,
            fontSize: 16,
            fontWeight: '600',
        },
        dropdownContainer: {
            backgroundColor: theme.background,
            borderRadius: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: theme.secondary || '#666',
            padding: spacing.sm,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
        },
        dropdownItem: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomColor: theme.secondary || '#eee',
            borderRadius: 8,
            marginBottom: 4,
        },
        dropdownText: {
            color: theme.text,
            fontSize: 16,
            fontWeight: '500',
        },
    });
