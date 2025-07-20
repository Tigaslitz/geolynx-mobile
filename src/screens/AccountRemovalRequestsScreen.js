// Mesma lógica de negócio, só o estilo e layout foram modernizados
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    FlatList,
    BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { getTheme } from '../services/GeneralFunctions';
import { darkmode, lightmode } from '../theme/colors';
import { spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountRemovalRequestsScreen() {
    const navigation = useNavigation();
    const { getAccountsForRemoval, removeUser, activateAccount } = useUser();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const mode = await getTheme();
            setTheme(mode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
        fetchRequests();
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

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getAccountsForRemoval();
            setRequests(data);
        } catch (err) {
            Alert.alert('Erro', 'Falha ao buscar pedidos de remoção.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action, user) => {
        const identifier = user.email || user.username;
        const message = action === 'remove'
            ? `Tem a certeza que deseja remover permanentemente ${identifier}? Esta ação é irreversível.`
            : `Deseja cancelar o pedido de remoção de ${identifier} e reativar a conta?`;

        Alert.alert('Confirmar Ação', message, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', onPress: () => executeAction(action, identifier) },
        ]);
    };

    const executeAction = async (action, identifier) => {
        setProcessing(true);
        try {
            if (action === 'remove') await removeUser(identifier);
            if (action === 'cancel') await activateAccount(identifier);
            fetchRequests();
        } catch {
            Alert.alert('Erro', 'Ação falhou.');
        } finally {
            setProcessing(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.personalInfo?.nome} {item.personalInfo?.apelido || ''}</Text>
            <Text style={styles.info}>Username: {item.username}</Text>
            <Text style={styles.info}>Email: {item.email}</Text>
            <Text style={styles.info}>Role: {item.role}</Text>
            <Text style={styles.status}>PENDING REMOVAL</Text>
            <View style={styles.buttonsRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleAction('remove', item)}
                    disabled={processing}
                >
                    <Text style={styles.buttonText}>Remover</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleAction('cancel', item)}
                    disabled={processing}
                >
                    <Text style={styles.buttonText}>Cancelar Pedido</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Pedidos de Remoção</Text>
                <Text style={styles.subtitle}>Reveja os pedidos antes de tomar ações</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
                ) : requests.length === 0 ? (
                    <Text style={styles.noRequests}>Nenhum pedido de remoção pendente.</Text>
                ) : (
                    <FlatList
                        data={requests}
                        keyExtractor={(item) => item.username}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                )}

                <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.backButton}>
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
        fontSize: 14,
        color: theme.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    noRequests: {
        textAlign: 'center',
        color: theme.text,
        marginTop: spacing.lg,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: theme.cardShadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme.text,
    },
    info: {
        fontSize: 14,
        color: theme.textSecondary || '#555',
        marginTop: 2,
    },
    status: {
        color: '#dc2626',
        fontWeight: 'bold',
        marginTop: spacing.sm,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: 10,
        alignItems: 'center',
    },
    removeButton: {
        backgroundColor: '#dc2626',
    },
    cancelButton: {
        backgroundColor: '#22c55e',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    backButton: {
        marginTop: spacing.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: theme.primary,
        borderRadius: 10,
        alignItems: 'center',
    },
    backText: {
        color: theme.primary,
        fontWeight: '600',
    },
});
