import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useWorkSheets } from '../contexts/WorkSheetContext';
import { theme, spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {getTheme} from "../services/GeneralFunctions";
import {darkmode, lightmode} from "../theme/colors";

const FIELD_LABELS = {
    startingDate: 'Data de Início',
    finishingDate: 'Data de Fim',
    issueDate: 'Data de Emissão',
    awardDate: 'Data de Adjudicação',
    serviceProviderId: 'ID do Prestador de Serviço',
    issuingUserId: 'ID do Emitente',
    posaCode: 'Código POSA',
    posaDescription: 'Descrição POSA',
    pospCode: 'Código POSP',
    pospDescription: 'Descrição POSP',
    aigp: 'AIGP',
};

export default function WorkSheetScreen({ route, navigation }) {
    const { id } = route.params;
    const { currentSheet, getWorkSheetById, saveWorkSheet, loading } = useWorkSheets();
    const [form, setForm] = useState(null);
    const [editing, setEditing] = useState(false);
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
        const load = async () => {
            const data = await getWorkSheetById(id);
            setForm(data?.metadata || {});
        };
        load();
    }, [id]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleEdit = async () => {
        if (editing) {
            const updatedSheet = { ...currentSheet, metadata: form };
            const result = await saveWorkSheet(updatedSheet);
            if (result.success) {
                Alert.alert('Sucesso', 'Folha guardada com sucesso!');
                setEditing(false);
                await getWorkSheetById(id);
            } else {
                Alert.alert('Erro', result.error || 'Não foi possível guardar.');
            }
        } else {
            setEditing(true);
        }
    };

    const handleOpenOperations = () => {
        navigation.navigate('Operations', {
            operations: form.operations || [],
        });
    };

    if (loading || !form) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    const { operations = [], ...otherFields } = form;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{form.aigp || 'Detalhes'}</Text>

                {Object.entries(otherFields)
                    .filter(([key]) => key !== 'id')
                    .map(([key, value]) => (
                        <View key={key} style={styles.inputBlock}>
                            <Text style={styles.label}>{FIELD_LABELS[key] || key}</Text>
                            <TextInput
                                style={[styles.input, !editing && styles.readOnly]}
                                value={String(value)}
                                editable={editing}
                                onChangeText={text => handleChange(key, text)}
                            />
                        </View>
                    ))}

                {/* Botão para operações */}
                <TouchableOpacity
                    style={[styles.operationsButton, editing && styles.disabledButton]}
                    onPress={handleOpenOperations}
                    disabled={editing}
                >
                    <Text style={styles.buttonText}>Operações ({operations.length})</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleToggleEdit}>
                    <Text style={styles.buttonText}>{editing ? 'Guardar' : 'Editar'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: spacing.lg,
        backgroundColor: theme.background,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    inputBlock: {
        marginBottom: spacing.md,
    },
    label: {
        fontWeight: '500',
        color: theme.text,
        marginBottom: 4,
    },
    input: {
        backgroundColor: theme.surface,
        borderColor: theme.primary,
        borderWidth: 1,
        borderRadius: 6,
        padding: spacing.sm,
        fontSize: 16,
        color: theme.text
    },
    readOnly: {
        backgroundColor: theme.surface,
    },
    button: {
        marginTop: spacing.lg,
        backgroundColor: theme.primary,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    operationsButton: {
        marginTop: spacing.md,
        backgroundColor: theme.secondary || '#666',
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: '600',
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
});
