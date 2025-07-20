import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    BackHandler
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import {darkmode, lightmode} from "../theme/colors";
import {getTheme} from "../services/GeneralFunctions";
import {useFocusEffect} from "@react-navigation/native";

export default function AdminAccountManagement({ route, navigation }) {
    const { userId } = route.params;
    const { getAccountStatus, activateAccount, deactivateAccount, suspendAccount, requestAccountRemoval } = useUser();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
        fetchStatus();
    }, []);


    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('AdminDashboard');
                return true; // bloqueia o comportamento padrão
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await getAccountStatus(userId);
            setStatus(res.status);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível obter o estado da conta.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        Alert.alert(
            'Confirmar Ação',
            getDialogMessage(action),
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => executeAction(action),
                },
            ]
        );
    };

    const executeAction = async (action) => {
        setProcessing(true);
        try {
            const data = userId;
            switch (action) {
                case 'activate':
                    await activateAccount(data);
                    break;
                case 'deactivate':
                    await deactivateAccount(data);
                    break;
                case 'suspend':
                    await suspendAccount(data);
                    break;
                case 'requestRemoval':
                    await requestAccountRemoval(data);
                    break;
            }
            await fetchStatus();
        } catch (error) {
            Alert.alert('Erro', 'Ação falhou.');
        } finally {
            setProcessing(false);
        }
    };

    const getDialogMessage = (action) => {
        switch (action) {
            case 'activate':
                return 'Deseja ativar esta conta?';
            case 'deactivate':
                return 'Deseja desativar esta conta?';
            case 'suspend':
                return 'Deseja suspender esta conta?';
            case 'requestRemoval':
                return 'Deseja marcar esta conta para remoção?';
            default:
                return '';
        }
    };

    const renderActionButton = (label, action , disabled = false) => (
        <TouchableOpacity
            style={[styles.actionButton, disabled && styles.disabledButton]}
            onPress={() => handleAction(action)}
            disabled={processing || disabled}
        >
            <Text style={styles.actionText}>{label}</Text>
        </TouchableOpacity>
    );

    const getStatusLabel = (status) => {
        const labels = {
            ATIVADA: 'Ativa',
            DESATIVADA: 'Desativada',
            SUSPENSA: 'Suspensa',
            A_REMOVER: 'Remoção Pendente',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Gestão de Conta</Text>
                <Text style={styles.subtitle}>
                    Estado atual: <Text style={styles.status}>{getStatusLabel(status)}</Text>
                </Text>

                {status === 'A_REMOVER' && (
                    <Text style={styles.alert}>
                        Esta conta está marcada para remoção. Nenhuma ação adicional pode ser tomada.
                    </Text>
                )}

                <View style={styles.actionsContainer}>
                    {status !== 'ATIVADA' && renderActionButton('Ativar Conta', 'activate')}
                    {status !== 'DESATIVADA' && status !== 'A_REMOVER' && renderActionButton('Desativar Conta', 'deactivate')}
                    {status !== 'SUSPENSA' && status !== 'A_REMOVER' && renderActionButton('Suspender Conta', 'suspend')}
                    {status !== 'A_REMOVER' && renderActionButton('Pedir Remoção', 'requestRemoval')}
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backButton}>
                    <Text style={styles.backText}>Voltar à lista de utilizadores</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: theme.background || '#fff',
    },
    card: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme.card || '#f8fafc',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: theme.text || '#000',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
        color: theme.text || '#000',
    },
    status: {
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    alert: {
        color: '#f97316',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    actionsContainer: {
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#94a3b8',
    },
    backButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    backText: {
        color: '#3b82f6',
        textAlign: 'center',
        fontWeight: '500',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

