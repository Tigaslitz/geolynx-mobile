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
import {darkmode, lightmode} from "../theme/colors";
import {getTheme} from "../services/GeneralFunctions";
import {useUser} from "../contexts/UserContext";

export default function ChangeAttributesScreen ({ route, navigation }) {
    const { userId } = route.params;
    const { getUserById, updateUser} = useUser();
    const [userFetched, setUserFetched] = useState(null);
    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: '',
            nationality: '',
            residence: '',
            address: '',
            postalCode: '',
            phonePrimary: '',
            phoneSecondary: '',
            taxId: '',
            dateOfBirth: '',
        },
        professionalInfo: {
            employer: '',
            jobTitle: '',
            employerTaxId: '',
        },
        identificationInfo: {
            citizenCard: '',
            citizenCardIssueDate: '',
            citizenCardValidity: '',
            citizenCardIssuePlace: '',
        },
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);


    useEffect(() => {
        const loadUserData = async () => {
            try {
                const res = await getUserById(userId);
                console.log(res);
                setUserFetched(res);
                setFormData({
                    personalInfo: {
                        fullName: res.fullName || '',
                        nationality: res.nationality || '',
                        residence: res.residence || '',
                        address: res.address || '',
                        postalCode: res.postalCode || '',
                        phonePrimary: res.phonePrimary || '',
                        phoneSecondary: res.phoneSecondary || '',
                        taxId: res.taxId || '',
                        dateOfBirth: res.dateOfBirth || '',
                    },
                    professionalInfo: {
                        employer: res.employer || '',
                        jobTitle: res.jobTitle || '',
                        employerTaxId: res.employerTaxId || '',
                    },
                    identificationInfo: {
                        citizenCard: res.citizenCard || '',
                        citizenCardIssueDate: res.citizenCardIssueDate || '',
                        citizenCardValidity: res.citizenCardValidity || '',
                        citizenCardIssuePlace: res.citizenCardIssuePlace || '',
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
            console.log("zangado",payload)
            const payload = Object.fromEntries(
                Object.entries(allAttributes).filter(
                    ([_, value]) => value !== '' && value !== null && value !== undefined
                )
            );
            console.log("zangado",payload);
            await updateUser(userFetched,payload);

            Alert.alert('Sucesso', 'Atributos atualizados com sucesso!');
            navigation.navigate('AdminDashboard');
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || 'Erro ao atualizar atributos';
            Alert.alert('Erro', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!userFetched) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Utilizador não encontrado.</Text>
            </View>
        );
    }

    const renderInput = (label, section, field, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={formData[section][field]}
                onChangeText={(text) => handleChange(section, field, text)}
                editable={!submitting}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Alterar Atributos do Utilizador</Text>
            <Text style={styles.subtitle}>
                {userFetched.username} ({userFetched.email})
            </Text>

            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            {renderInput('Nome Completo', 'personalInfo', 'fullName')}
            {renderInput('Nacionalidade', 'personalInfo', 'nationality')}
            {renderInput('Morada', 'personalInfo', 'address')}
            {renderInput('Código Postal', 'personalInfo', 'postalCode')}
            {renderInput('Telefone Principal', 'personalInfo', 'phonePrimary', 'phone-pad')}
            {renderInput('Telefone Secundário', 'personalInfo', 'phoneSecondary', 'phone-pad')}
            {renderInput('NIF', 'personalInfo', 'taxId')}
            {renderInput('Data de Nascimento', 'personalInfo', 'dateOfBirth')}
            {renderInput('Localidade', 'personalInfo', 'residence')}

            <Text style={styles.sectionTitle}>Informações Profissionais</Text>
            {renderInput('Organização', 'professionalInfo', 'employer')}
            {renderInput('Cargo', 'professionalInfo', 'jobTitle')}
            {renderInput('NIF da Organização', 'professionalInfo', 'employerTaxId')}

            <Text style={styles.sectionTitle}>Informações de Identificação</Text>
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
                    <Text style={styles.buttonText}>
                        {submitting ? 'A atualizar...' : 'Atualizar'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.navigate('AdminDashboard')}
                    disabled={submitting}
                >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    cancelButtonText: {
        color: '#3b82f6',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
});
