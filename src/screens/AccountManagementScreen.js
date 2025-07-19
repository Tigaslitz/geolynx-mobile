import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Keyboard, Platform
} from 'react-native';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../contexts/UserContext';
import {getTheme, startupTheme} from "../services/GeneralFunctions";

export default function AccountManagement() {
    const {user, setUser, updateUser} = useUser();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        phonePrimary: '',
        address: '',
        postalCode: '',
        dateOfBirth: '',
        nationality: '',
        residence: '',
    });

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                phonePrimary: user.phonePrimary || '',
                address: user.address || '',
                postalCode: user.postalCode || '',
                dateOfBirth: user.dateOfBirth || '',
                nationality: user.nationality || '',
                residence: user.residence || '',
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        setForm((prev) => ({...prev, [field]: value}));
    };

    const handleSave = async () => {
        const payload = Object.entries(form)
            .filter(([_, value]) => value && value.trim() !== '')
            .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});

        console.log('Payload to update:', payload);
        const result = await updateUser(user, payload);
        Keyboard.dismiss();

        if (result.success) {
            Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
        } else {
            Alert.alert('Erro', result.error || 'Não foi possível atualizar os dados.');
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            // formata para YYYY-MM-DD
            const yyyy = selectedDate.getFullYear();
            const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(selectedDate.getDate()).padStart(2, '0');
            handleChange('dateOfBirth', `${yyyy}-${mm}-${dd}`);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

            {/* Campos visíveis mas não editáveis */}
            <View style={styles.infoBlock}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.staticText}>{user.email}</Text>
                <View style={{ height: 5 }} />
                <Text style={styles.label}>Função</Text>
                <Text style={styles.staticText}>{user.role}</Text>
            </View>

            {/* Campos editáveis genéricos (exceto Data de Nascimento) */}
            {[
                {label: 'Nome completo', field: 'fullName'},
                {label: 'Telemóvel', field: 'phonePrimary'},
                {label: 'Morada', field: 'address'},
                {label: 'Código Postal', field: 'postalCode'},
                {label: 'Nacionalidade', field: 'nationality'},
                {label: 'Residência', field: 'residence'},
            ].map(({label, field}) => (
                <View key={field} style={styles.inputBlock}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        style={styles.input}
                        value={form[field]}
                        onChangeText={(value) => handleChange(field, value)}
                        placeholder={`Introduz ${label.toLowerCase()}`}
                        placeholderTextColor={theme.text}
                    />
                </View>
            ))}

            {/* Campo de Data de Nascimento com DateTimePicker */}
            <View style={styles.inputBlock}>
                <Text style={styles.label}>Data de Nascimento</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            color: theme.text,
                        }}
                    >
                        {form.dateOfBirth || 'Seleciona a data'}
                    </Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
                    mode="date"
                    display="calendar"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            {/* Botão de guardar */}
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Guardar Alterações</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            padding: spacing.lg,
            backgroundColor: theme.background,
        },
        title: {
            fontSize: 26,
            fontWeight: '700',
            color: theme.primary,
            marginBottom: spacing.lg,
            marginTop:50,
            textAlign: 'center',
        },
        inputBlock: {
            marginBottom: spacing.md,
        },
        infoBlock: {
            marginBottom: spacing.lg,
            backgroundColor: theme.surface,
            padding: 10,
            borderRadius: 8,
        },
        label: {
            fontWeight: 'bold',
            fontSize:15,
            color: theme.text,
            marginBottom: 4,
        },
        input: {
            backgroundColor: theme.background,
            borderColor: theme.border || '#ccc',
            borderWidth: 1,
            borderRadius: 6,
            padding: spacing.sm,
            fontSize: 16,
            color: theme.text,
        },
        staticText: {
            fontSize: 16,
            color: theme.text,
            marginBottom: spacing.sm,
        },
        button: {
            marginTop: spacing.lg,
            backgroundColor: theme.primary,
            padding: spacing.md,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: theme.white,
            fontSize: 16,
            fontWeight: '600',
        },
    });
