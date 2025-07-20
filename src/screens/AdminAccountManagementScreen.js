import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { darkmode, lightmode } from '../theme/colors';
import { getTheme } from '../services/GeneralFunctions';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAccountManagement({ route, navigation }) {
    const { userId } = route.params;
    const {
        getAccountStatus,
        activateAccount,
        deactivateAccount,
        suspendAccount,
        requestAccountRemoval,
    } = useUser();

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
                return true;
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

    const handleAction = (action) => {
        Alert.alert('Confirmar Ação', getDialogMessage(action), [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', onPress: () => executeAction(action) },
        ]);
    };

    const executeAction = async (action) => {
        setProcessing(true);
        try {
            switch (action) {
                case 'activate':
                    await activateAccount(userId);
                    break;
                case 'deactivate':
                    await deactivateAccount(userId);
                    break;
                case 'suspend':
                    await suspendAccount(userId);
                    break;
                case 'requestRemoval':
                    await requestAccountRemoval(userId);
                    break;
            }
            await fetchStatus();
        } catch {
            Alert.alert('Erro', 'Ação falhou.');
        } finally {
            setProcessing(false);
        }
    };

    const getDialogMessage = (action) => {
        const messages = {
            activate: 'Deseja ativar esta conta?',
            deactivate: 'Deseja desativar esta conta?',
            suspend: 'Deseja suspender esta conta?',
            requestRemoval: 'Deseja marcar esta conta para remoção?',
        };
        return messages[action] || '';
    };

    const renderButton = (label, action, disabled = false) => (
        <TouchableOpacity
            style={[styles.button, disabled ? styles.disabledButton : styles.activeButton]}
            onPress={() => handleAction(action)}
            disabled={processing || disabled}
        >
            <Text style={styles.buttonText}>{label}</Text>
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
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Gestão de Conta</Text>
                <Text style={styles.subtitle}>Estado atual: <Text style={styles.status}>{getStatusLabel(status)}</Text></Text>

                {status === 'A_REMOVER' && (
                    <Text style={styles.alert}>
                        Esta conta está marcada para remoção. Nenhuma ação adicional pode ser tomada.
                    </Text>
                )}

                <View style={styles.card}>
                    {status !== 'ATIVADA' && renderButton('Ativar Conta', 'activate')}
                    {status !== 'DESATIVADA' && status !== 'A_REMOVER' && renderButton('Desativar Conta', 'deactivate')}
                    {status !== 'SUSPENSA' && status !== 'A_REMOVER' && renderButton('Suspender Conta', 'suspend')}
                    {status !== 'A_REMOVER' && renderButton('Pedir Remoção', 'requestRemoval')}
                </View>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('AdminDashboard')}
                >
                    <Text style={styles.backText}>Voltar ao Dashboard</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: theme.primary,
        paddingBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: theme.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    status: {
        fontWeight: 'bold',
        color: theme.secondary,
    },
    alert: {
        color: '#f97316',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: theme.cardShadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        paddingVertical: spacing.md,
        borderRadius: 10,
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: theme.primary,
    },
    disabledButton: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    backButton: {
        padding: spacing.md,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.primary,
        alignItems: 'center',
    },
    backText: {
        color: theme.primary,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
