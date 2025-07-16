import React, {useEffect, useState} from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../theme';

export default function ProfileScreen({navigation}) {
    const { getUser } = useAuth();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUser();
            setUserData(data);
        };
        fetchUser();
    }, []);

    const handleEdit = () => {
        navigation.navigate('AccountManagement', { user: userData });
    };

    if (!userData) return null; // ou <Loading />
    console.log("aqui " + userData.username, userData.email);
    return (
        <View style={styles.container}>
            <Image
                style={styles.avatar}
                source={{
                    uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                }}
            />
            <Text style={styles.name}>{userData.username}</Text>
            <Text style={styles.email}>{userData.email}</Text>

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editText}>Editar Perfil</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.lg,
        backgroundColor: colors.white,
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    email: {
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    editButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    editText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
});
