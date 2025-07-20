import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { useWorkSheets } from '../contexts/WorkSheetContext';
import { theme as appTheme, spacing } from '../theme'; // Renomeado para evitar conflito
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polygon } from 'react-native-maps';
import { getTheme } from "../services/GeneralFunctions";
import { darkmode, lightmode } from "../theme/colors";

// Mapeamento de labels para os campos do formulário
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

    // Carrega o tema da aplicação (dark/light)
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

    // Manipulador para atualizar o estado do formulário
    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Alterna entre o modo de edição e visualização, guardando os dados se necessário
    const handleToggleEdit = async () => {
        if (editing) {
            const updatedSheet = { ...currentSheet, metadata: form };
            const result = await saveWorkSheet(updatedSheet);
            if (result.success) {
                Alert.alert('Sucesso', 'Folha de obra guardada com sucesso!');
                setEditing(false);
                await getWorkSheetById(id); // Recarrega os dados para garantir consistência
            } else {
                Alert.alert('Erro', result.error || 'Não foi possível guardar as alterações.');
            }
        } else {
            setEditing(true);
        }
    };

    // Navega para o ecrã de operações
    const handleOpenOperations = () => {
        navigation.navigate('Operations', {
            operations: form.operations || [],
        });
    };

    // Otimiza o cálculo da região inicial do mapa para evitar recálculos
    const initialRegion = useMemo(() => {
        // Verifica se existem features e coordenadas válidas
        const firstFeature = currentSheet?.features?.[0];
        const firstRing = firstFeature?.geometry?.coordinates?.[0];
        const firstPoint = firstRing?.[0];

        if (!firstPoint || firstPoint.length < 2) {
            // Retorna uma região padrão (ex: Lisboa) se não houver coordenadas
            return {
                latitude: 38.7223,
                longitude: -9.1393,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            };
        }

        // A estrutura de coordenadas é [longitude, latitude]
        const [longitude, latitude] = firstPoint;

        return {
            latitude,
            longitude,
            latitudeDelta: 0.01, // Zoom inicial
            longitudeDelta: 0.01,
        };
    }, [currentSheet]);

    // Exibe um indicador de loading enquanto os dados não estiverem prontos
    if (loading || !form || !currentSheet) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Separa as operações dos outros campos do formulário para renderização
    const { operations = [], ...otherFields } = form;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{form.aigp || 'Detalhes da Folha de Obra'}</Text>

                {/* Renderiza os campos de metadados */}
                {Object.entries(otherFields)
                    .filter(([key]) => key !== 'id') // Não exibe o campo 'id'
                    .map(([key, value]) => (
                        <View key={key} style={styles.inputBlock}>
                            <Text style={styles.label}>{FIELD_LABELS[key] || key}</Text>
                            <TextInput
                                style={[styles.input, !editing && styles.readOnly]}
                                value={String(value ?? '')} // Garante que o valor seja sempre uma string
                                editable={editing}
                                onChangeText={text => handleChange(key, text)}
                                placeholderTextColor={theme.placeholder}
                            />
                        </View>
                    ))}

                {/* Secção do Mapa - Renderiza apenas se houver features */}
                {currentSheet?.features?.length > 0 && (
                    <View style={styles.mapContainer}>
                        <Text style={styles.mapTitle}>Mapa das Parcelas</Text>
                        <MapView
                            style={styles.map}
                            initialRegion={initialRegion}
                            scrollEnabled={true}
                            zoomEnabled={true}
                        >
                            {/* Itera sobre cada feature para desenhar um polígono */}
                            {currentSheet.features.map((feature, index) => {
                                const geometry = feature?.geometry;

                                if (!geometry || !geometry.coordinates) return null;

                                let outerRing = [];

                                if (
                                    geometry.type === "Polygon" &&
                                    Array.isArray(geometry.coordinates) &&
                                    geometry.coordinates.every(
                                        ring => Array.isArray(ring) && ring.length === 1 && Array.isArray(ring[0])
                                    )
                                ) {
                                    outerRing = geometry.coordinates.map(ring => ring[0]);
                                } else if (Array.isArray(geometry.coordinates[0])) {
                                    outerRing = geometry.coordinates[0];
                                }

                                const polygonCoords = outerRing.map(([lng, lat]) => ({
                                    latitude: lat,
                                    longitude: lng,
                                }));

                                console.log("polygonCoords: ", polygonCoords);

                                if (polygonCoords.length < 3) return null;

                                return (
                                    <Polygon
                                        key={feature.properties?.polygonId || index}
                                        coordinates={polygonCoords}
                                        strokeColor="#FF0000"
                                        fillColor="rgba(255,0,0,0.3)"
                                        strokeWidth={2}
                                    />
                                );
                            })}
                        </MapView>
                    </View>
                )}

                {/* Botão para ver as operações */}
                <TouchableOpacity
                    style={[styles.operationsButton, editing && styles.disabledButton]}
                    onPress={handleOpenOperations}
                    disabled={editing}
                >
                    <Text style={styles.buttonText}>Operações ({operations.length})</Text>
                </TouchableOpacity>

                {/* Botão para editar ou guardar */}
                <TouchableOpacity style={styles.button} onPress={handleToggleEdit}>
                    <Text style={styles.buttonText}>{editing ? 'Guardar' : 'Editar'}</Text>
                </TouchableOpacity>
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
        backgroundColor: theme.background,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: theme.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    inputBlock: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.surface,
        borderColor: theme.border || theme.primary,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 16,
        color: theme.text,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    readOnly: {
        backgroundColor: theme.background,
        color: theme.text,
        opacity: 0.8,
    },
    button: {
        marginTop: spacing.lg,
        backgroundColor: theme.primary,
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    operationsButton: {
        marginTop: spacing.md,
        backgroundColor: theme.secondary || '#6c757d',
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: theme.white || '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    mapContainer: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        padding: spacing.md,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    map: {
        width: '100%',
        height: Dimensions.get('window').width * 0.8,
    },
});

