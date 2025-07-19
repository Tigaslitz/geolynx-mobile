import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import { MaterialIcons } from "@expo/vector-icons";
import {startupTheme} from "../services/GeneralFunctions";

export default function Login({navigation}) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await startupTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert('Inválido', 'Preencha todos os campos');
        setLoading(true);
        try {
            const result = await login(email, password);
            if (!result.success)
                Alert.alert('Inválido', result.error || 'Credenciais inválidas');
        } catch {
            Alert.alert('Inválido', 'Credenciais inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Image
                    source={require('../../assets/Logo_GeoLynx.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Login</Text>
                <TextInput style={styles.input} placeholder="Email" placeholderTextColor={theme.text} keyboardType="email-address" autoCapitalize="none"
                           value={email} onChangeText={setEmail}/>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor={theme.text}
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
                            color={theme.text}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => handleLogin()} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'A carregar...' : 'Entrar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Não tens conta?
                    Regista-te</Text></TouchableOpacity>
            </ScrollView>
        </View>

    );
}

const getStyles = (theme) =>
 StyleSheet.create({
    container: {
        flex:1,
        justifyContent:'center',
        padding:spacing.md,
        backgroundColor:theme.background
    },
    title: {
        fontSize:32,
        fontWeight:'700',
        marginBottom:spacing.lg,
        color:theme.primary,
        textAlign:'center'
    },

    input: {
        color:theme.text,
        backgroundColor:theme.surface,
        padding:spacing.sm,borderRadius:4,
        marginBottom:spacing.md,
        borderWidth:1,
        borderColor:theme.primary
    },

    button: {
        backgroundColor:theme.primary,
        padding:spacing.md,
        borderRadius:4,
        alignItems:'center',
        marginBottom:spacing.sm
    },

    buttonText: {
        color:theme.white,
        fontWeight:'600'
    },

    link: {
        color:theme.primary,
        textAlign:'center',
        marginTop:spacing.sm
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
        color:theme.text,
        flex: 1,
        paddingVertical: spacing.sm,
    },
     scrollContent: {
         padding: spacing.md,
         paddingBottom: 40,
     },
     logo: {
         width: 150,
         height: 150,
         alignSelf: 'center',
         marginTop:90,

         // iOS shadow properties
         shadowColor: theme.black,
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.3,
         shadowRadius: 3,

         // Android elevation for shadow
         elevation: 5,
     }

});
