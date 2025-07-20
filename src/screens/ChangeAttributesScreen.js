// ChangeAttributesScreen.js reestilizado com visual moderno
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { userService } from '../services/api';
import { darkmode, lightmode } from '../theme/colors';
import { getTheme } from '../services/GeneralFunctions';
import { useUser } from '../contexts/UserContext';
import { spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangeAttributesScreen({ route, navigation }) {
    const { userId } = route.params;
    const { getUserById, updateUser } = useUser();
    const [userFetched, setUserFetched] = useState(null);
    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: '', nationality: '', residence: '', address: '',
            postalCode: '', phonePrimary: '', phoneSecondary: '', taxId: '', dateOfBirth: '',
        },
        professionalInfo: {
            employer: '', jobTitle: '', employerTaxId: '',
        },
        identificationInfo: {
            citizenCard: '', citizenCardIssueDate: '', citizenCardValidity: '', citizenCardIssuePlace: '',
        },
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const mode = await getTheme();
            setTheme(mode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const res = await getUserById(userId);
                setUserFetched(res);
                setFormData({
                    personalInfo: {
                        fullName: res.fullName || '', nationality: res.nationality || '', residence: res.residence || '',
                        address: res.address || '', postalCode: res.postalCode || '',
                        phonePrimary: res.phonePrimary || '', phoneSecondary: res.phoneSecondary || '',
                        taxId: res.taxId || '', dateOfBirth: res.dateOfBirth || '',
                    },
                    professionalInfo: {
                        employer: res.employer || '', jobTitle: res.jobTitle || '', employerTaxId: res.employerTaxId || '',
                    },
                    identificationInfo: {
                        citizenCard: res.citizenCard || '', citizenCardIssueDate: res.citizenCardIssueDate || '',
                        citizenCardValidity: res.citizenCardValidity || '', citizenCardIssuePlace: res.citizenCardIssuePlace || '',
                    },
                });
            } catch (err) {
                Alert.alert('Erro', 'Falha ao carregar dados do utilizador.');
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [userId]);

    const handleChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const allAttributes = {
                ...formData.personalInfo,
                ...formData.professionalInfo,
                ...formData.identificationInfo,
            };
            const payload = Object.fromEntries(
                Object.entries(allAttributes).filter(
                    ([_, value]) => value !== '' && value !== null && value !== undefined
                )
            );
            await updateUser(userFetched, payload);
            Alert.alert('Sucesso', 'Atributos atualizados com sucesso!');
            navigation.navigate('AdminDashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Erro ao atualizar atributos';
            Alert.alert('Erro', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const renderInput = (label, section, field, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={formData[section][field]}
                onChangeText={(text) => handleChange(section, field, text)}
                editable={!submitting}
                keyboardType={keyboardType}
                placeholder="..."
                placeholderTextColor="#999"
            />
        </View>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    if (!userFetched) {
        return <View style={styles.centered}><Text style={styles.errorText}>Utilizador não encontrado.</Text></View>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Alterar Atributos</Text>
                <Text style={styles.subtitle}>{userFetched.username} ({userFetched.email})</Text>

                <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                {renderInput('Nome Completo', 'personalInfo', 'fullName')}
                {renderInput('Nacionalidade', 'personalInfo', 'nationality')}
                {renderInput('Localidade', 'personalInfo', 'residence')}
                {renderInput('Morada', 'personalInfo', 'address')}
                {renderInput('Código Postal', 'personalInfo', 'postalCode')}
                {renderInput('Telefone Principal', 'personalInfo', 'phonePrimary', 'phone-pad')}
                {renderInput('Telefone Secundário', 'personalInfo', 'phoneSecondary', 'phone-pad')}
                {renderInput('NIF', 'personalInfo', 'taxId')}
                {renderInput('Data de Nascimento', 'personalInfo', 'dateOfBirth')}

                <Text style={styles.sectionTitle}>Informações Profissionais</Text>
                {renderInput('Organização', 'professionalInfo', 'employer')}
                {renderInput('Cargo', 'professionalInfo', 'jobTitle')}
                {renderInput('NIF da Organização', 'professionalInfo', 'employerTaxId')}

                <Text style={styles.sectionTitle}>Identificação</Text>
                {renderInput('Cartão de Cidadão', 'identificationInfo', 'citizenCard')}
                {renderInput('Data de Emissão', 'identificationInfo', 'citizenCardIssueDate')}
                {renderInput('Validade', 'identificationInfo', 'citizenCardValidity')}
                {renderInput('Local de Emissão', 'identificationInfo', 'citizenCardIssuePlace')}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>{submitting ? 'A atualizar...' : 'Atualizar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.navigate('AdminDashboard')}
                        disabled={submitting}
                    >
                        <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 14,
        color: theme.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: theme.text,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: spacing.sm,
        fontSize: 16,
        backgroundColor: theme.surface,
        color: theme.text,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: theme.primary,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: theme.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cancelText: {
        color: theme.primary,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
});
