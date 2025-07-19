import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert, ScrollView,
} from 'react-native';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import {MaterialIcons} from "@expo/vector-icons";
import {getTheme, startupTheme} from "../services/GeneralFunctions";

export default function Register({navigation}) {
    const {register} = useAuth();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await startupTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            return Alert.alert('Inválido', 'As passwords não coincidem');
        }

        setLoading(true);
        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: 'VU',
                profile: 'PRIVADO',
            });

            if (result.success) {
                Alert.alert('Sucesso', 'Registo efetuado! Por favor, faça login.');
                navigation.replace('Login');
            } else {
                Alert.alert('Erro', result.error || 'Não foi possível registar.');
            }
        } catch (err) {
            Alert.alert('Erro', 'Um erro inesperado ocorreu, por favor tente novamente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Registar</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={theme.text}
                    value={formData.username}
                    onChangeText={(text) => handleChange('username', text)}
                    autoCapitalize="words"
                    textContentType="username"
                    autoComplete="username"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor={theme.text}
                    value={formData.fullName}
                    onChangeText={(text) => handleChange('fullName', text)}
                    autoCapitalize="words"
                    textContentType="name"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.text}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    textContentType="emailAddress"
                    autoComplete="email"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Telemóvel"
                    placeholderTextColor={theme.text}
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor={theme.text}
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(text) => handleChange('password', text)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                        <MaterialIcons
                            name={showPassword ? 'visibility' : 'visibility-off'}
                            size={24}
                            color={theme.text}
                        />
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Password"
                    placeholderTextColor={theme.text}
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    textContentType="password"
                    autoComplete="password"
                />


                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'A carregar...' : 'Registar'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                    <Text style={styles.link}>Já tens conta? Entra</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: theme.background,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: spacing.lg,
        color: theme.primary,
        textAlign: 'center',
        marginTop: 80,
    },
    input: {
        backgroundColor: theme.surface,
        padding: spacing.sm,
        borderRadius: 4,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: theme.primary,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: theme.primary,
        padding: spacing.md,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    buttonText: {
        color: theme.white,
        fontWeight: '600',
    },
    link: {
        color: theme.primary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.primary,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: spacing.sm,
    },
});