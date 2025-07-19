import React, { useEffect, useState } from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,Image,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import roleScreens from '../components/roleScreens';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import api from '../services/api';
import {useUser} from "../contexts/UserContext";
import {getTheme} from "../services/GeneralFunctions";

const screenButtons = [
    { name: 'ListUsers', label: 'Listar Usuários' },
    { name: 'ExecutionSheets', label: 'Nova Operação' },
    { name: 'Profile', label: 'Perfil' },
    { name: 'WorkSheetList', label: 'Minhas Fichas' },
    // Adicione todos os botões/screens
];

export default function Home({navigation}) {
    const {user} = useUser();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [totalUsers, setTotalUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        const unsubscribe = navigation.addListener('focus', loadTheme); // recheck theme when screen regains focus

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        api.get('/users/count')
            .then(res => setTotalUsers(res.data.count))
            .catch(() => setTotalUsers('-'))
            .finally(() => setLoading(false));
    }, []);

    const StatCard = ({ title, value, iconName, iconColor }) => (
        <View style={styles.statCard}>
            <MaterialIcons name={iconName} size={32} color={iconColor} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    const QuickActionCard = ({ title, iconName, path, role }) => {
        const { hasRole } = useUser();
        const navigation = useNavigation();

        if (!roleScreens[user.role]?.includes(path)) return null;

        return (
            <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate(path)}
            >
                <MaterialIcons name={iconName} size={28} color={theme.white} />
                <Text style={styles.actionTitle}>{title}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text
                    style={styles.welcome}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    Bem‑vindo, {user.fullName}!
                </Text>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Image
                        source={require('../../assets/Logo_GeoLynx.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.statsRow}>
                    {loading
                        ? <ActivityIndicator size="large" color={theme.primary}/>
                        : (
                            <>
                                <StatCard
                                    title="Total de Utilizadores"
                                    value={totalUsers}
                                    iconName="people"
                                    iconColor={theme.primary}
                                />
                                <StatCard
                                    title="Folhas de Obra Ativas"
                                    value="12"
                                    iconName="assignment"
                                    iconColor={theme.secondary}
                                />
                            </>
                        )
                    }
                </View>

                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                <View style={styles.actionsRow}>
                    <QuickActionCard
                        title="Nova Operação"
                        iconName="add"
                        path="ExecutionSheets"
                    />
                    <QuickActionCard
                        title="Minhas Fichas"
                        iconName="list-alt"
                        path="WorkSheetList"
                    />
                    <QuickActionCard
                        title="Gerir Utilizadores"
                        iconName="people"
                        path="ListUsers"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        padding: spacing.md,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    welcome: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        marginBottom: spacing.lg,
        color: theme.text,
        paddingLeft: 20,
        flexShrink: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: theme.background,
        borderRadius: 8,
        marginHorizontal: spacing.xs,
        elevation: 2,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: spacing.sm,
        color: theme.text,
    },
    statTitle: {
        marginTop: spacing.xs,
        color: theme.text,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.sm,
        color: theme.text,
    },
    actionsRow: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: theme.primary,
        borderRadius: 8,
        marginHorizontal: spacing.xs,
    },
    actionTitle: {
        marginTop: spacing.sm,
        color: theme.white,
        fontSize: 14,
        textAlign: 'center',
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    profileButton: {
        marginRight: 5,
        padding: spacing.xs,
        borderRadius: 100,
        backgroundColor: theme.text,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        backgroundColor: theme.secondary,
        padding: spacing.md,
        borderRadius: 8,
    },
    logoutText: {
        color: theme.white,
        marginLeft: spacing.sm,
        fontSize: 16,
        fontWeight: '600',
    },
});
