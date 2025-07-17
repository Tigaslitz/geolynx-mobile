import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { colors, spacing } from '../theme';

export default function ListUsers({ navigation }) {
    const { hasRole } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users')
            .then(res => setUsers(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (!hasRole('SYSADMIN')) {
        return <Text style={styles.error}>Acesso negado</Text>;
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => navigation.navigate('AccountManagement', { user: item })}
                        >
                            <Text style={styles.itemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
        backgroundColor: colors.background
    },

    item: {
        padding: spacing.sm,
        borderBottomWidth: 1,
        borderColor: colors.surface
    },

    itemText: {
        fontSize: 16,
        color: colors.text
    },

    error: {
        flex: 1,
        textAlign: 'center',
        marginTop: spacing.lg,
        color: colors.error
    }
});
