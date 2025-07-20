import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    FlatList, BackHandler,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { getTheme } from '../services/GeneralFunctions';
import { darkmode, lightmode } from '../theme/colors';

export default function AccountRemovalRequestsScreen() {
    const navigation = useNavigation();
    const {getAccountsForRemoval, removeUser, activateAccount,} = useUser();

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
                return true; // bloqueia o comportamento padrão
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const requests = await getAccountsForRemoval();
            setRequests(requests);
        } catch (err) {
            Alert.alert('Erro', 'Falha ao buscar pedidos de remoção.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action, user) => {
        const data = user.email || user.username ;
        const message =
            action === 'remove'
                ? `Tem a certeza que deseja remover permanentemente ${data.identificador}? Esta ação é irreversível.`
                : `Deseja cancelar o pedido de remoção de ${data.identificador} e reativar a conta?`;

        Alert.alert(
            'Confirmar Ação',
            message,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => executeAction(action, data),
                },
            ]
        );
    };

    const executeAction = async (action, data) => {
        setProcessing(true);
        try {
            if (action === 'remove') {
                console.log("zimba", data);
                await removeUser(data);
            } else if (action === 'cancel') {
                console.log("zimba2", data);
                await activateAccount(data);
            }
            fetchRequests();
        } catch (err) {
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
                    style={[styles.button, styles.removeButton]}
                    onPress={() => handleAction('remove', item)}
                    disabled={processing}
                >
                    <Text style={styles.buttonText}>Remover</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => handleAction('cancel', item)}
                    disabled={processing}
                >
                    <Text style={styles.buttonText}>Cancelar Pedido</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Pedidos de Remoção de Conta</Text>
            <Text style={styles.subtext}>Reveja os pedidos antes de tomar ações</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
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
                <Text style={styles.backText}>Voltar à lista de utilizadores</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: theme.background,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    noRequests: {
        fontStyle: 'italic',
        color: '#475569',
        marginTop: 20,
    },
    card: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    info: {
        color: '#334155',
        fontSize: 14,
        marginTop: 4,
    },
    status: {
        color: '#dc2626',
        marginTop: 8,
        fontWeight: 'bold',
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        borderRadius: 8,
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
        marginTop: 24,
        padding: 12,
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    backText: {
        color: '#3b82f6',
        fontWeight: '500',
    },
});
