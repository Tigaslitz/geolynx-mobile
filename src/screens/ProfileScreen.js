import React, {useEffect, useState} from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert, ActivityIndicator,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default async function ProfileScreen({navigation}) {
    console.log('ProfileScreen');
    const {user, setUser, getUser, loading} = useUser();
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('../../assets/Logo_GeoLynx.png')}
                    style={styles.loadingImage}
                />
            </View>
        );
    }

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUser();
            console.log("aqui ", {
                data
            })
            setUser(data);
        };
        fetchUser();
    }, []);

    const handleEdit = () => {
        navigation.navigate('AccountManagement');
    };

    if (!user) return null; // ou <Loading />
    return (
        <View style={styles.container}>
            <Image
                style={styles.avatar}
                source={{
                    uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                }}
            />
            <Text style={styles.name}>{user.fullName}</Text>
            <Text style={styles.email}>{user.email}</Text>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editText}>Editar Perfil</Text>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.lg,
        backgroundColor: theme.white,
    },

    name: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.text,
        marginBottom: spacing.sm,
    },

    email: {
        fontSize: 16,
        color: theme.text,
        marginBottom: spacing.lg,
    },

    editButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: theme.primary,
        borderRadius: 8,
    },

    editText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: '500',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },

    loadingImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
});
