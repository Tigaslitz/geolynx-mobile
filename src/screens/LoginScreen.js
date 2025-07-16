import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing } from '../theme';
import {MaterialIcons} from "@expo/vector-icons";

export default function Login({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert('Inválido', 'Preencha todos os campos');
        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                navigation.replace('Home');
            } else {
                Alert.alert('Inválido', result.error || 'Credenciais inválidas');
            }
        } catch {
            Alert.alert('Inválido', 'Credenciais inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'A carregar...' : 'Entrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Não tens conta? Regista-te</Text></TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({ container: { flex:1, justifyContent:'center', padding:spacing.md, backgroundColor:colors.background }, title: { fontSize:32,fontWeight:'700',marginBottom:spacing.lg,color:colors.primary,textAlign:'center' }, input: { backgroundColor:colors.surface,padding:spacing.sm,borderRadius:4,marginBottom:spacing.md,borderWidth:1,borderColor:colors.primary }, button: { backgroundColor:colors.primary,padding:spacing.md,borderRadius:4,alignItems:'center',marginBottom:spacing.sm }, buttonText: { color:colors.white,fontWeight:'600' }, link: { color:colors.primary,textAlign:'center',marginTop:spacing.sm },passwordContainer: {
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
    }, });
