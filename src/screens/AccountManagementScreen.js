import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { colors, spacing } from '../theme';
import { useUser } from '../contexts/UserContext';

export default function AccountManagement() {
    const { user, updateUser } = useUser();

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        postalCode: '',
        birthDate: '',
        nationality: '',
        residence: '',
    });

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
                postalCode: user.postalCode || '',
                birthDate: user.birthDate || '',
                nationality: user.nationality || '',
                residence: user.residence || '',
            });
        }
    }, [user]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        console.log("um" + user.id)
        const result = await updateUser(user,form);

        if (result.success) {
            Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
        } else {
            Alert.alert('Erro', result.error || 'Não foi possível atualizar os dados.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

            {/* Campos visíveis mas não editáveis */}
            <View style={styles.infoBlock}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.staticText}>{user.email}</Text>
                <Text style={styles.label}>Função</Text>
                <Text style={styles.staticText}>{user.role}</Text>
            </View>

            {/* Campos editáveis */}
            {[
                { label: 'Nome completo', field: 'fullName' },
                { label: 'Telemóvel', field: 'phone' },
                { label: 'Morada', field: 'address' },
                { label: 'Código Postal', field: 'postalCode' },
                { label: 'Data de Nascimento', field: 'birthDate' },
                { label: 'Nacionalidade', field: 'nationality' },
                { label: 'Residência', field: 'residence' },
            ].map(({ label, field }) => (
                <View key={field} style={styles.inputBlock}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        style={styles.input}
                        value={form[field]}
                        onChangeText={(value) => handleChange(field, value)}
                        placeholder={`Introduz ${label.toLowerCase()}`}
                    />
                </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Guardar Alterações</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    inputBlock: {
        marginBottom: spacing.md,
    },
    infoBlock: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 8,
    },
    label: {
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.border || '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        padding: spacing.sm,
        fontSize: 16,
    },
    staticText: {
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    button: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
