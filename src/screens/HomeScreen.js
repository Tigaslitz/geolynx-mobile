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
    const {user, listUsers} = useUser();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [totalUsers, setTotalUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const canViewUsers = roleScreens[user.role]?.includes('ListUsers');
    const canViewSheets = roleScreens[user.role]?.includes('WorkSheetList');


    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        const unsubscribe = navigation.addListener('focus', loadTheme); // recheck theme when screen regains focus

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        const loadUserInfo = async () => {
            if (!canViewUsers) {
                setLoading(false);
                return;
            }
            const nUsers = (await listUsers())?.length || 0;
            setTotalUsers(nUsers);
            setLoading(false);
        };
        loadUserInfo();
    }, [canViewUsers]);

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

    const PrettyUpName = (fullName, theme) => {
        if (!fullName || typeof fullName !== 'string') return null;

        const nameSet = fullName.trim().split(/\s+/); // handle multiple spaces
        const primaryStyle = { fontWeight: 'bold', color: theme.primary };
        const secondaryStyle = { fontWeight: 'bold', color: theme.secondary };

        if (nameSet.length >= 2) {
            const [firstWord, ...restWords] = nameSet;
            return (
                <Text>
                    <Text style={primaryStyle}>{firstWord} </Text>
                    <Text style={secondaryStyle}>{restWords.join(' ')}</Text>
                </Text>
            );
        } else {
            const word = nameSet[0];
            const mid = Math.floor(word.length / 2);
            const firstHalf = word.slice(0, mid);
            const secondHalf = word.slice(mid);

            return (
                <Text>
                    <Text style={primaryStyle}>{firstHalf}</Text>
                    <Text style={secondaryStyle}>{secondHalf}</Text>
                </Text>
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text
                    style={styles.welcome}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    <Text>Bem-vindo,{"\n"}</Text>
                    {PrettyUpName(user.fullName, theme)}
                </Text>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Image
                        //source={require('../../assets/Logo_GeoLynx.png')}
                        source={require('../../assets/defaultProfilePic.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.statsRow}>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} />
                    ) : (
                        <>
                            {canViewUsers && (
                                <StatCard
                                    title="Total de Utilizadores"
                                    value={totalUsers}
                                    iconName="people"
                                    iconColor={theme.primary}
                                />
                            )}
                            {canViewSheets && (
                                <StatCard
                                    title="Folhas de Obra Ativas"
                                    value="12"
                                    iconName="assignment"
                                    iconColor={theme.secondary}
                                />
                            )}
                        </>
                    )}
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
        marginTop: spacing.md,
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
        backgroundColor: theme.surface,
        borderRadius: 16,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
        elevation: 3,
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.primary,
        marginTop: spacing.sm,
    },
    statTitle: {
        fontSize: 13,
        color: theme.text,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: spacing.sm,
        color: theme.text,
    },
    actionCard: {
        flexBasis: '48%',
        backgroundColor: theme.primary,
        borderRadius: 16,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.md,
        alignItems: 'center',
        elevation: 3,
    },
    actionTitle: {
        marginTop: spacing.sm,
        fontSize: 14,
        fontWeight: '600',
        color: theme.white,
        textAlign: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    profileButton: {
        marginRight: 5,
        padding: 2,
        borderRadius: 100,
        backgroundColor: theme.primary,
    },
    profileButton2: {
        padding: 4,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: theme.white,
        backgroundColor: theme.infoBackground,
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
