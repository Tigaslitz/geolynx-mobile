import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator as RNActivityIndicator,
} from 'react-native';
import {
    Searchbar,
    Card,
    Avatar,
    Chip,
    IconButton,
    Button,
    Snackbar,
    Dialog,
    Portal,
    Text,
    ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';

export default function ListUsers ({navigation}) {
    const {user, listUsers, removeUser} = useUser();
    const [filtered, setFiltered] = useState (null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 12;

    const [snackbar, setSnackbar] = useState(null);

    const [dialog, setDialog] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await listUsers();
            setUsers(res.data || []);
        } catch {
            setSnackbar({visible: true, msg: 'Erro ao carregar utilizadores'});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filt = users.filter(u =>
            (u.username + u.email + (u.fullName || '') + u.role)
                .toLowerCase()
                .includes(lower)
        );
        setFiltered(filt);
        setPage(1);
    }, [searchTerm, users]);

    const slice = filtered.slice((page - 1) * perPage, page * perPage);

    const onDeleteConfirmed = async () => {
        if (!dialog.user) return;
        try {
            await removeUser({identificador: dialog.user.username});
            setSnackbar({visible: true, msg: 'Utilizador removido'});
            fetchUsers();
        } catch {
            setSnackbar({visible: true, msg: 'Erro ao remover utilizador'});
        } finally {
            setDialog({visible: false, user: null});
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator animating size="large"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Pesquisar..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.search}
            />

            <FlatList
                data={slice}
                keyExtractor={u => u.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({item}) => (
                    <UserCard
                        user={item}
                        onEdit={id => navigation.navigate('ChangeAttributes', {userId: id})}
                        onManage={id =>
                            navigation.navigate('AccountManagement', {userId: id})
                        }
                        onChangeRole={id =>
                            navigation.navigate('ChangeRole', {userId: id})
                        }
                        onDelete={u => setDialog({visible: true, user: u})}
                    />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.center}>
                        <Text>Nenhum utilizador encontrado.</Text>
                    </View>
                )}
            />

            <View style={styles.pagination}>
                <Button
                    mode="outlined"
                    disabled={page === 1}
                    onPress={() => setPage(p => p - 1)}
                >
                    Anterior
                </Button>
                <Text style={styles.pageText}>
                    {page} / {Math.ceil(filtered.length / perPage) || 1}
                </Text>
                <Button
                    mode="outlined"
                    disabled={page * perPage >= filtered.length}
                    onPress={() => setPage(p => p + 1)}
                >
                    Seguinte
                </Button>
            </View>

            <Portal>
                <Dialog
                    visible={dialog.visible}
                    onDismiss={() => setDialog({visible: false, user: null})}
                >
                    <Dialog.Title>Confirmar Remoção</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Remover utilizador{' '}
                            <Text style={{fontWeight: 'bold'}}>
                                {dialog.user?.username}
                            </Text>
                            ?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialog({visible: false, user: null})}>
                            Cancelar
                        </Button>
                        <Button onPress={onDeleteConfirmed} buttonColor="red">
                            Remover
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar(s => ({...s, visible: false}))}
                duration={3000}
            >
                {snackbar.msg}
            </Snackbar>
        </View>
    );
};

    const UserCard = ({user, onEdit, onChangeRole, onDelete, onManage}) => {
        const fullName = user.fullName || user.username;
        const status = user.accountStatus;
        const role = user.role;

        const rolesMap = {
            SYSADMIN: 'admin-panel-settings',
            SMBO: 'account-circle',
            RU: 'account',
            PO: 'account-tie',
            ADLU: 'account-badge',
            PRBO: 'account-star',
            SGVBO: 'account-group',
            SDVBO: 'account-multiple',
            VU: 'account-outline',
        };

        const statusMap = {
            ACTIVE: {icon: 'lock-open', color: 'green', label: 'Ativo'},
            INACTIVE: {icon: 'lock', color: 'red', label: 'Inativo'},
            SUSPENDED: {icon: 'lock-alert', color: 'orange', label: 'Suspenso'},
            PENDING_REMOVAL: {icon: 'delete-alert', color: 'red', label: 'Remoção Pendente'},
        };

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Avatar.Text size={40} label={fullName.charAt(0)}/>
                        <View style={styles.cardInfo}>
                            <Text numberOfLines={1} style={styles.cardTitle}>{fullName}</Text>
                            <Text numberOfLines={1} variant="bodySmall">{user.email}</Text>
                        </View>
                    </View>
                    <View style={styles.chipsRow}>
                        <Chip
                            icon={rolesMap[role] || 'account'}
                            style={styles.chip}
                            compact
                        >
                            {role}
                        </Chip>
                        <Chip
                            icon={statusMap[status]?.icon}
                            style={[styles.chip, {backgroundColor: statusMap[status]?.color + '22'}]}
                            textStyle={{color: statusMap[status]?.color}}
                            compact
                        >
                            {statusMap[status]?.label}
                        </Chip>
                    </View>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                    <IconButton
                        icon="account-cog"
                        size={20}
                        onPress={() => onManage(user.id)}
                    />
                    <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => onEdit(user.id)}
                    />
                    <IconButton
                        icon="shield-account"
                        size={20}
                        disabled={role === 'SYSADMIN'}
                        onPress={() => onChangeRole(user.id)}
                    />
                    <IconButton
                        icon="delete"
                        size={20}
                        disabled={role === 'SYSADMIN'}
                        onPress={() => onDelete(user)}
                    />
                </Card.Actions>
            </Card>
        );
    };
