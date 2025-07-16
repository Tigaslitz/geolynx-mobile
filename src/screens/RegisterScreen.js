import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { colors, spacing } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import {MaterialIcons} from "@expo/vector-icons";

export default function Register({ navigation }) {
    const { register } = useAuth();
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

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
            <Text style={styles.title}>Registar</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={formData.username}
                onChangeText={(text) => handleChange('username', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Nome completo"
                value={formData.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Telemóvel"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={setFormData}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                    <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Confirmar Password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: spacing.lg,
        color: colors.primary,
        textAlign: 'center',
    },
    input: {
        backgroundColor: colors.surface,
        padding: spacing.sm,
        borderRadius: 4,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    buttonText: {
        color: colors.white,
        fontWeight: '600',
    },
    link: {
        color: colors.primary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.primary,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: spacing.sm,
    },
});