import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default async function ListUsers({navigation}) {
    console.log('ListUsers');
    const { hasRole } = useAuth();
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
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
                <ActivityIndicator size="large" color={theme.primary}/>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => navigation.navigate('AccountManagement', {user: item})}
                        >
                            <Text style={styles.itemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
        backgroundColor: theme.background
    },

    item: {
        padding: spacing.sm,
        borderBottomWidth: 1,
        borderColor: theme.surface
    },

    itemText: {
        fontSize: 16,
        color: theme.text
    },

    error: {
        flex: 1,
        textAlign: 'center',
        marginTop: spacing.lg,
        color: theme.error
    }
});
