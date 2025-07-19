import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { lightmode, darkmode } from '../theme/colors';
import { getTheme } from '../services/GeneralFunctions';
import { spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from "../contexts/UserContext";
import { useExecutionSheets } from '../contexts/ExecutionSheetContext';

const FIELD_LABELS = {
    operationId: 'ID da Operação',
    status: 'Estado',
    startingDate: 'Data de Início',
    finishingDate: 'Data de Fim',
    lastActivityDate: 'Última Atividade',
    observations: 'Observações',
    operatorId: 'ID do Operador'
};

export default function PolygonOperationScreen({ route, navigation }) {
    const { polygonOperation } = route.params;
    const { user } = useUser();
    const { startActivity, stopActivity, getAssignments, setExecutionSheets } = useExecutionSheets();
    const [loading, setLoading] = useState(false);
    const [localPolygonOperation, setLocalPolygonOperation] = useState(polygonOperation);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const mode = await getTheme();
            setTheme(mode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const updatePolygonState = async () => {
        const updatedAssignments = await getAssignments();
        setExecutionSheets(updatedAssignments); // Atualiza contexto global
        const updatedSheet = updatedAssignments.find(
            sheet => sheet.executionSheetId === route.params.executionSheetId
        );
        const updatedPolygon = updatedSheet?.polygons?.find(
            p => p.polygonId === localPolygonOperation.polygonId
        );
        if (updatedPolygon) setLocalPolygonOperation(updatedPolygon);
    };

    const handleStartActivity = async (i) => {
        setLoading(true);
        try {
            const response = await startActivity({
                executionSheetId: route.params.executionSheetId,
                polygonId: localPolygonOperation.polygonId,
                operationId: localPolygonOperation.operations[i].operationId
            });
            if (response.success) {
                Alert.alert('Sucesso', 'Atividade iniciada com sucesso.');
                navigation.navigate('Home');
            } else {
                Alert.alert('Erro', response.error || 'Erro inesperado ao iniciar atividade');
            }
        } catch (e) {
            Alert.alert('Erro', 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };


    const handleStopActivity = async (i) => {
        setLoading(true);
        try {
            const response = await stopActivity({
                executionSheetId: route.params.executionSheetId,
                polygonId: localPolygonOperation.polygonId,
                operationId: localPolygonOperation.operations[i].operationId
            });
            if (response.success) {
                Alert.alert('Sucesso', 'Atividade terminada com sucesso.');
                navigation.navigate('Home');
            } else {
                Alert.alert('Erro', response.error || 'Erro inesperado ao terminar atividade');
            }
        } catch (e) {
            Alert.alert('Erro', 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Polígono {localPolygonOperation.polygonId}</Text>
                {localPolygonOperation.operations.map((detail, idx) => {
                    let buttonText = 'Começar Atividade';
                    let buttonAction = () => handleStartActivity(idx);
                    let disabled = loading;

                    if (detail.status === 'ongoing') {
                        buttonText = 'Terminar Atividade';
                        buttonAction = () => handleStopActivity(idx);
                    } else if (detail.status === 'completed') {
                        buttonText = 'Atividade Finalizada';
                        disabled = true;
                        buttonAction = null;
                    }

                    return (
                        <View key={detail.operationId || idx} style={styles.detailBlock}>
                            <Text style={styles.detailTitle}>Operação {detail.operationId}</Text>
                            {Object.entries(detail).map(([key, value]) => {
                                if (key === 'tracks' || key === 'operationId' || key === 'operatorId') return null;
                                return (
                                    <View key={key} style={styles.infoBlock}>
                                        <Text style={styles.label}>{FIELD_LABELS[key] || key}</Text>
                                        <Text style={styles.value}>{String(value)}</Text>
                                    </View>
                                );
                            })}
                            <View style={styles.infoBlock}>
                                <Text style={styles.label}>Operador</Text>
                                <Text style={styles.value}>{user?.fullName || 'Desconhecido'}</Text>
                            </View>
                            {detail.tracks && detail.tracks.length > 0 && (
                                <View style={styles.tracksContainer}>
                                    <Text style={styles.detailTitle}>Área</Text>
                                    {detail.tracks.map((track, tIdx) => {
                                        const polygonCoords = track.coordinates.map(coord => ({
                                            latitude: coord[1],
                                            longitude: coord[0]
                                        }));
                                        const initialRegion = polygonCoords.length > 0
                                            ? {
                                                latitude: polygonCoords[0].latitude,
                                                longitude: polygonCoords[0].longitude,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01
                                            }
                                            : {
                                                latitude: 0,
                                                longitude: 0,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01
                                            };
                                        return (
                                            <View key={tIdx} style={styles.trackBlock}>
                                                <Text style={styles.trackType}>Tipo: {track.type}</Text>
                                                <MapView
                                                    style={styles.map}
                                                    initialRegion={initialRegion}
                                                    scrollEnabled={true}
                                                    zoomEnabled={true}
                                                >
                                                    <Polygon
                                                        coordinates={polygonCoords}
                                                        strokeColor="#FF0000"
                                                        fillColor="rgba(255,0,0,0.3)"
                                                        strokeWidth={2}
                                                    />
                                                </MapView>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.startButton,
                                    detail.status === 'completed' && styles.disabledButton
                                ]}
                                onPress={buttonAction}
                                disabled={disabled}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    detail.status === 'completed' && styles.disabledButtonText
                                ]}>
                                    {buttonText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
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
        fontSize: 28,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    detailBlock: {
        marginBottom: spacing.lg,
        backgroundColor: theme.surface,
        borderRadius: 8,
        borderColor: theme.primary,
        borderWidth: 1,
        padding: spacing.md,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.primary,
        marginBottom: spacing.sm,
    },
    infoBlock: {
        marginBottom: spacing.sm,
    },
    label: {
        fontWeight: '800',
        fontSize: 15,
        color: theme.text,
        marginBottom: 2,
    },
    value: {
        color: theme.text,
        fontSize: 16,
    },
    tracksContainer: {
        marginTop: spacing.md,
    },
    trackBlock: {
        marginBottom: spacing.md,
        backgroundColor: theme.background,
        borderRadius: 8,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: theme.primary,
    },
    trackType: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 4,
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    startButton: {
        marginTop: spacing.lg,
        backgroundColor: theme.primary,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: theme.background,
        opacity: 0.5,
        borderWidth: 1,
        borderColor: theme.primary,
    },
    disabledButtonText: {
        color: theme.primary,
        opacity: 0.5,
    }
});