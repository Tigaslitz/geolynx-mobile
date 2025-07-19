import React, {useEffect, useState} from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert, ActivityIndicator, Switch, ScrollView,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {changeTheme, getTheme} from "../services/GeneralFunctions";
import Constants from "expo-constants";
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "../contexts/AuthContext";

export default function ProfileScreen({navigation}) {
    const {user, setUser, getUser, loading} = useUser();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const { logout } = useAuth();
    const { deleteUser } = useUser();

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            const isDark = themeMode === 'dark';
            setIsDarkMode(isDark);
            setTheme(isDark ? darkmode : lightmode);
        };

        const unsubscribe = navigation.addListener('focus', loadTheme); // recheck on focus
        loadTheme(); // also load immediately

        return unsubscribe;
    }, [navigation]);


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
            setUser(data);
        };
        fetchUser();
    }, []);

    const handleEdit = () => {
        navigation.navigate('AccountManagement');
    };

    const toggleTheme = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        await changeTheme(newTheme); // saves to SecureStore
        setIsDarkMode(!isDarkMode); // updates switch state
        setTheme(newTheme === 'dark' ? darkmode : lightmode); // updates visual theme
    };

    const confirmLogoutAccount = () => {
        Alert.alert(
            "Confirmar Encerramento de Sessão",
            "Tem a certeza que deseja encerrar a sessão atual? Será reencaminhado ao ecrã de Login.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Encerrar",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoginScreen' }],
                        });
                    }
                }
            ]
        );
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            "Confirmar Eliminação",
            "Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        deleteUser();
                        // optionally, logout or navigate away after deletion
                        logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoginScreen' }],
                        });
                    }
                }
            ]
        );
    };

    if (!user) return null; // ou <Loading />
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                <View style={{ height: 20 }} />
                <View style={styles.separator} />
                <View style={{ height: 10 }} />

                <View style={styles.row}>
                    <Text style={styles.label}>Modo Escuro</Text>
                    <Switch value={isDarkMode} onValueChange={toggleTheme} />
                </View>

                <View style={[styles.previewBox, {
                    backgroundColor: isDarkMode ? lightmode.background : darkmode.background,
                    borderColor: isDarkMode ? lightmode.border : darkmode.border,
                    alignItems: 'center',
                }]}>
                    <Image
                        source={require('../../assets/Logo_GeoLynx.png')}
                        style={styles.previewLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.previewTitle}>
                        <Text style={{ color: theme.primary }}>Geo</Text>
                        <Text style={{ color: theme.secondary }}>Lynx</Text>
                    </Text>

                    <Text style={{
                        color: isDarkMode ? lightmode.text : darkmode.text,
                        fontWeight: 'bold',
                        marginTop: 8,
                        marginBottom: 6,
                    }}>
                        Pré-visualização do {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                    </Text>
                    <Text style={{ color: isDarkMode ? lightmode.text : darkmode.text }}>
                        Este é um exemplo de como o tema {isDarkMode ? 'claro' : 'escuro'} ficará.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.manualButton}
                    onPress={() => navigation.navigate('UserManualScreen')}
                >
                    <Text style={styles.manualText}>Manual de Utilizador</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={() => confirmLogoutAccount()}>
                    <Text style={styles.logoutText}>Terminar Sessão</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteAccountButton} onPress={confirmDeleteAccount}>
                    <Text style={styles.deleteAccountText}>Eliminar Conta</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Versão {Constants.expoConfig?.version || '1.0.0'}</Text>
                    <Text style={styles.footerText}>© {new Date().getFullYear()}
                        <Text style={{ fontWeight: 'bold', color: theme.primary }}> Geo</Text>
                        <Text style={{ fontWeight: 'bold', color: theme.secondary }}>Lynx</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        width: 130,
        height: 130,
        borderRadius: 100,
        marginBottom: spacing.lg,
        backgroundColor: theme.white,
        marginTop:50,
    },

    name: {
        fontSize: 30,
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
        paddingVertical: 16,
        paddingHorizontal: 132,
        backgroundColor: theme.primary,
        borderRadius: 8,
    },

    editText: {
        color: theme.background,
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

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: theme.text,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        gap: 10,
    },
    label: {
        fontSize: 18,
        color: theme.text,
    },

    footer: {
        marginTop: 40,
        alignItems: 'center',
    },

    footerText: {
        fontSize: 14,
        color: theme.text,
        opacity: 0.6,
    },
    logoutButton: {
        backgroundColor: theme.secondary,
        paddingVertical: 16,
        paddingHorizontal: 110,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    logoutText: {
        color: theme.background,
        fontSize: 16,
        fontWeight: 'bold',
    },

    deleteAccountButton: {
        backgroundColor: theme.error,
        paddingVertical: 16,
        paddingHorizontal: 120,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    deleteAccountText: {
        color: theme.background,
        fontSize: 16,
        fontWeight: 'bold',
    },

    manualButton: {
        backgroundColor: theme.primary,
        paddingVertical: 16,
        paddingHorizontal: 95,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    manualText: {
        color: theme.background,
        fontSize: 16,
        fontWeight: 'bold',
    },

    previewBox: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 10,
        minWidth: 350,
    },

    previewLogo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 0,    // no margin here
        // iOS shadow properties
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,

        // Android elevation for shadow
        elevation: 5,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -25,      // negative margin pulls it up closer to the logo
        marginBottom: 8,    // keep a bit of space below if you want
    },

    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },

    scrollContent: {
        alignItems: 'center',
        padding: spacing.md,
        paddingBottom: 40, // extra space at the bottom
    },

    separator: {
        width: '98%',
        height: 5,
        backgroundColor: theme.text, // for debugging
        marginVertical: spacing.md,
        borderRadius: 8,
    },

    spacer: {
        flex: 1,
    },
});
