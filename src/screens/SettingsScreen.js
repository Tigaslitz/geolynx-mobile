import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {getTheme, changeTheme, logoutTheme} from '../services/GeneralFunctions';
import { lightmode, darkmode } from '../theme/colors';
import {useAuth} from "../contexts/AuthContext";
import {useUser} from "../contexts/UserContext";
import { Alert } from 'react-native';

export default function SettingsScreen({navigation}) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const { logout } = useAuth();
    const { deleteUser } = useUser();

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            const isDark = themeMode === 'dark';
            setIsDarkMode(isDark);
            setTheme(isDark ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        await changeTheme(newTheme); // saves to SecureStore
        setIsDarkMode(!isDarkMode); // updates switch state
        setTheme(newTheme === 'dark' ? darkmode : lightmode); // updates visual theme
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

    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Definições</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Modo Escuro</Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>

            <View style={[styles.previewBox, {
                backgroundColor: isDarkMode ? lightmode.background : darkmode.background,
                borderColor: isDarkMode ? lightmode.border : darkmode.border,
                alignItems: 'center', // center contents horizontally
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

            <View style={styles.spacer} />

            <TouchableOpacity
                style={styles.manualButton}
                onPress={() => navigation.navigate('UserManualScreen')}
            >
                <Text style={styles.manualText}>Manual de Utilizador</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
                <Text style={styles.logoutText}>Terminar Sessão</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteAccountButton} onPress={() => confirmDeleteAccount()}>
                <Text style={styles.deleteAccountText}>Eliminar Conta</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Versão {Constants.expoConfig?.version || '1.0.0'}</Text>
                <Text style={styles.footerText}>© {new Date().getFullYear()} GeoLynx</Text>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        padding: 20,
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
        paddingVertical: 12,
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
        paddingVertical: 12,
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
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
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

    spacer: {
        flex: 1,
    },
});
