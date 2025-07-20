import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput,} from 'react-native';
import { KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import roleScreens from '../components/roleScreens';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import api from '../services/api';
import {useUser} from "../contexts/UserContext";
import {getTheme} from "../services/GeneralFunctions";
import AdminDashboard from "./AdminDashboardScreen";
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useMap } from "../contexts/MapContext";

const screenButtons = [
    { name: 'AdminDashboard', label: 'Listar Usuários' },
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
    const [region, setRegion] = useState(null);
    const canViewUsers = roleScreens[user.role]?.includes('ListUsers');
    const canViewSheets = roleScreens[user.role]?.includes('WorkSheetList');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showShadow, setShowShadow] = useState(false);
    const [animals, setAnimals] = useState([]);
    const [historicalCuriosities, setHistoricalCuriosities] = useState([]);
    const [initialRegion, setInitialRegion] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const lastFetchedRegion = useRef(null);
    const debounceTimeout = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isImageValid, setIsImageValid] = useState(null);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newMarkerCoords, setNewMarkerCoords] = useState(null);
    const [formType, setFormType] = useState('animal'); // or 'site'
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {animalsSet, historicalCuriositiesSet, fetchAnimalsByGeohash, uploadAnimal, uploadHistoricalCuriosity} = useMap();
    const canManageUsers = roleScreens[user.role]?.includes('AdminDashboard');


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

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Permission to access location was denied');
                return;
            }

            const {
                coords: { latitude, longitude },
            } = await Location.getCurrentPositionAsync({});

            console.log("User location:", latitude, longitude); // Debugging

            const region = {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setUserLocation({ latitude, longitude });
            setInitialRegion(region);
            setRegion(region); // ✅ Critical Fix: actually set region
            lastFetchedRegion.current = region;
            fetchRegionData(latitude, longitude);
        };

        getLocation();
    }, []);

    const StatCard = ({ title, value, iconName, iconColor }) => (
        <View style={styles.statCard}>
            <MaterialIcons name={iconName} size={32} color={iconColor} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    const QuickActionCard = ({ title, iconName, path }) => {
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

    const fetchRegionData = async (latitude, longitude) => {
        try {
            const response = await api.get(`/region?lat=${latitude}&lng=${longitude}`);
            const data = response.data;

            console.log("📦 Raw Region Data:", data);

            // Validate and filter out bad entries
            const validAnimals = (data.animals || []).filter(a =>
                typeof a.latitude === 'number' && typeof a.longitude === 'number'
            );
            const validCuriosities = (data.historicalCuriosities || []).filter(c =>
                typeof c.latitude === 'number' && typeof c.longitude === 'number'
            );

            console.log(`✅ Found ${validAnimals.length} valid animals`);
            console.log(`✅ Found ${validCuriosities.length} valid curiosities`);

            setAnimals(validAnimals);
            setHistoricalCuriosities(validCuriosities);
        } catch (error) {
            console.error("❌ Error fetching region data:", error);
        }
    };
    const handleRegionChangeComplete = (newRegion) => {
        if (
            lastFetchedRegion.current &&
            Math.abs(lastFetchedRegion.current.latitude - newRegion.latitude) < 0.001 &&
            Math.abs(lastFetchedRegion.current.longitude - newRegion.longitude) < 0.001
        ) {
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchRegionData(newRegion.latitude, newRegion.longitude);
            lastFetchedRegion.current = newRegion;

            if (isAddingLocation) {
                setNewMarkerCoords({
                    latitude: newRegion.latitude,
                    longitude: newRegion.longitude,
                });
            }
        }, 1000);
    };

    useEffect(() => {
        const validateImage = async () => {
            if (selectedItem?.type === 'animal' && selectedItem.image) {
                try {
                    const parsedUrl = new URL(selectedItem.image);
                    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                        setIsImageValid(false);
                        return;
                    }

                    const response = await fetch(selectedItem.image, { method: 'HEAD' });
                    setIsImageValid(response.ok);
                } catch (e) {
                    console.log('Invalid image URL:', e);
                    setIsImageValid(false);
                }
            } else {
                setIsImageValid(null); // no image
            }
        };

        validateImage();
    }, [selectedItem]);

    if (isFullscreen && region) {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, position: 'relative' }}>
                    {region ? (
                        <MapView
                            style={styles.fullscreenMap}
                            region={region}
                            onRegionChangeComplete={(newRegion) => {
                                setRegion(newRegion);
                                handleRegionChangeComplete(newRegion);
                            }}
                        >
                            {userLocation && (
                                <Marker
                                    coordinate={userLocation}
                                    title="Você está aqui"
                                    pinColor={theme.error}
                                />
                            )}

                            {animals.map(animal =>
                                animal.latitude != null && animal.longitude != null ? (
                                    <Marker
                                        key={`animal-${animal.id}`}
                                        coordinate={{ latitude: animal.latitude, longitude: animal.longitude }}
                                        title={animal.name}
                                        description="Animal"
                                        pinColor={theme.primary}
                                        onPress={() => setSelectedItem({ type: 'animal', ...animal })}
                                    />
                                ) : null
                            )}

                            {historicalCuriosities.map(curiosity =>
                                curiosity.latitude != null && curiosity.longitude != null ? (
                                    <Marker
                                        key={`curiosity-${curiosity.id}`}
                                        coordinate={{ latitude: curiosity.latitude, longitude: curiosity.longitude }}
                                        title={curiosity.title}
                                        description="Curiosidade Histórica"
                                        pinColor={theme.secondary}
                                        onPress={() => setSelectedItem({ type: 'curiosity', ...curiosity })}
                                    />
                                ) : null
                            )}
                        </MapView>
                    ) : (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
                    )}
                    {isAddingLocation && (
                        <View
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: [{ translateX: -16 }, { translateY: -32 }],
                                zIndex: 10,
                                pointerEvents: 'none', // Important
                            }}
                        >
                            <Image
                                source={require('../../assets/pin.png')}
                                style={{ width: 32, height: 32 }}
                            />
                        </View>
                    )}

                    {selectedItem && (
                        <View
                            key={`${selectedItem.type}-${selectedItem.id}`} // forces re-render on change
                            style={[
                                {
                                    position: 'absolute',
                                    bottom: 30,
                                    left: 20,
                                    right: 20,
                                    padding: 16,
                                    borderRadius: 16,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 5,
                                },
                                selectedItem.type === 'animal'
                                    ? { backgroundColor: theme.primary }
                                    : { backgroundColor: theme.secondary }
                            ]}
                        >
                            {/* Display Image if it's an Animal and image is valid */}
                            {selectedItem.type === 'animal' && isImageValid !== null && (
                                isImageValid ? (
                                    <Image
                                        source={{ uri: selectedItem.image }}
                                        style={{
                                            width: '100%',
                                            height: 200,
                                            borderRadius: 10,
                                            marginBottom: 12,
                                            resizeMode: 'cover'
                                        }}
                                    />
                                ) : (
                                    <Image
                                        source={require('../../assets/imageUnavailable.png')}
                                        style={{
                                            width: '100%',
                                            height: 200,
                                            borderRadius: 10,
                                            marginBottom: 12,
                                            resizeMode: 'contain'
                                        }}
                                    />
                                )
                            )}

                            {/* Title */}
                            <Text
                                style={[
                                    {
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        color: selectedItem.type === 'animal' ? theme.white : theme.text,
                                    }
                                ]}
                            >
                                {selectedItem.type === 'animal' ? selectedItem.name : selectedItem.title}
                            </Text>

                            {/* Description */}
                            {selectedItem.description ? (
                                <Text
                                    style={{
                                        marginTop: 8,
                                        color: selectedItem.type === 'animal' ? theme.white : theme.text,
                                    }}
                                >
                                    {selectedItem.description}
                                </Text>
                            ) : (
                                <Text
                                    style={{
                                        marginTop: 8,
                                        color: selectedItem.type === 'animal' ? theme.white : theme.text,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    Sem descrição disponível.
                                </Text>
                            )}

                            {/* Close Button */}
                            <TouchableOpacity
                                style={{ marginTop: 12, alignSelf: 'flex-end' }}
                                onPress={() => setSelectedItem(null)}
                            >
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        color: selectedItem.type === 'animal' ? theme.white : theme.primary
                                    }}
                                >
                                    Fechar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {isAddingLocation && newMarkerCoords && (
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 20, // 👈 make sure this is above the buttons (they're probably zIndex: 10 or default)
                            }}
                        >
                            <ScrollView
                                contentContainerStyle={{ paddingBottom: 20 }}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View
                                    style={{
                                        margin: 20,
                                        backgroundColor: 'white',
                                        padding: 16,
                                        borderRadius: 12,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 5,
                                        zIndex: 50, // 👈 this ensures the form floats above any other absolute element
                                    }}
                                >

                                <Text style={{ textAlign: 'center', color: '#555', marginBottom: 8 }}>
                                        Mova o mapa para posicionar o marcador.
                                    </Text>
                                    {/* Type Toggle */}
                                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                backgroundColor: formType === 'animal' ? theme.primary : '#ddd',
                                                padding: 8,
                                                borderRadius: 8,
                                                marginRight: 4,
                                            }}
                                            onPress={() => setFormType('animal')}
                                        >
                                            <Text style={{ textAlign: 'center', color: 'white' }}>Animal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                backgroundColor: formType === 'site' ? theme.secondary : '#ddd',
                                                padding: 8,
                                                borderRadius: 8,
                                            }}
                                            onPress={() => setFormType('site')}
                                        >
                                            <Text style={{ textAlign: 'center', color: 'white' }}>Curiosidade</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Name Input */}
                                    <TextInput
                                        placeholder="Nome"
                                        value={name}
                                        onChangeText={setName}
                                        style={{
                                            borderColor: '#ccc',
                                            borderWidth: 1,
                                            borderRadius: 8,
                                            marginBottom: 10,
                                            padding: 8,
                                        }}
                                    />

                                    {/* Description Input */}
                                    <TextInput
                                        placeholder="Descrição"
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        style={{
                                            borderColor: '#ccc',
                                            borderWidth: 1,
                                            borderRadius: 8,
                                            marginBottom: 10,
                                            padding: 8,
                                            minHeight: 60,
                                        }}
                                    />

                                    {/* Confirm Button */}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: theme.primary,
                                            padding: 12,
                                            borderRadius: 8,
                                            marginBottom: 8,
                                        }}
                                        onPress={async () => {
                                            if (!name.trim() || !description.trim()) {
                                                alert('Por favor, preencha todos os campos.');
                                                return;
                                            }

                                            setIsLoading(true); // show spinner (optional)

                                            const basePayload = {
                                                latitude: newMarkerCoords.latitude,
                                                longitude: newMarkerCoords.longitude,
                                                description,
                                            };

                                            let result;

                                            if (formType === 'animal') {
                                                result = await uploadAnimal({ ...basePayload, name });
                                            } else {
                                                result = await uploadHistoricalCuriosity({ ...basePayload, title: name });
                                            }

                                            setIsLoading(false);

                                            if (result.success) {
                                                alert(`${formType === 'animal' ? 'Animal' : 'Curiosidade'} adicionada com sucesso!`);
                                                setIsAddingLocation(false);
                                                setNewMarkerCoords(null);
                                                setName('');
                                                setDescription('');
                                            } else {
                                                alert(result.error || 'Erro ao adicionar.');
                                            }
                                        }}
                                    >
                                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Salvar</Text>
                                    </TouchableOpacity>
                                    {isLoading && (
                                        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} />
                                    )}

                                    {/* Cancel Button */}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: theme.error,
                                            padding: 12,
                                            borderRadius: 8,
                                            marginBottom: 8,
                                        }}
                                        onPress={() => {
                                        setIsAddingLocation(false);
                                        setNewMarkerCoords(null);
                                        setName('');
                                        setDescription('');
                                    }}>
                                        <Text style={{ color: theme.white, textAlign: 'center' }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}

                    {/* Close Map Button */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 40,
                            right: 20,
                            backgroundColor: theme.primary,
                            padding: 12,
                            borderRadius: 8,
                            zIndex: 5,
                        }}
                        onPress={() => setIsFullscreen(false)}
                    >
                        <Text style={{ color: theme.white, fontWeight: 'bold' }}>Fechar Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 100,
                            right: 20,
                            backgroundColor: theme.secondary,
                            padding: 12,
                            paddingHorizontal: 23,
                            borderRadius: 8,
                            zIndex: 5,
                        }}
                        onPress={() => {
                            setIsAddingLocation(true);
                            setNewMarkerCoords(region); // place marker at current map center
                        }}
                    >
                        <Text style={{ color: theme.white, fontWeight: 'bold' }}>Adicionar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, showShadow && styles.headerShadow]}>
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
                        //source={require('../../assets/Logo_Geolynx.png')}
                        source={require('../../assets/defaultProfilePic.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.container}
                onScroll={({ nativeEvent }) => {
                    setShowShadow(nativeEvent.contentOffset.y > 10);
                }}
                scrollEventThrottle={16}
            >
                {region ? (
                    <MapView
                        style={styles.map}
                        region={region}
                        onRegionChangeComplete={(newRegion) => {
                            setRegion(newRegion);
                            handleRegionChangeComplete(newRegion);
                        }}
                    >
                        {userLocation && (
                            <Marker
                                coordinate={userLocation}
                                title="Você está aqui"
                                pinColor={theme.error}
                            />
                        )}

                        {animals.map(animal =>
                            animal.latitude != null && animal.longitude != null ? (
                                <Marker
                                    key={`animal-${animal.id}`}
                                    coordinate={{ latitude: animal.latitude, longitude: animal.longitude }}
                                    title={animal.name}
                                    description="Animal"
                                    pinColor={theme.primary}
                                />
                            ) : null
                        )}

                        {historicalCuriosities.map(curiosity =>
                            curiosity.latitude != null && curiosity.longitude != null ? (
                                <Marker
                                    key={`curiosity-${curiosity.id}`}
                                    coordinate={{ latitude: curiosity.latitude, longitude: curiosity.longitude }}
                                    title={curiosity.title}
                                    description="Curiosidade Histórica"
                                    pinColor={theme.secondary}
                                />
                            ) : null
                        )}
                    </MapView>
                ) : (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
                )}
                <TouchableOpacity
                    style={styles.fullscreenButton}
                    onPress={() => setIsFullscreen(true)}
                >
                    <Text style={styles.fullscreenText}>Modo Ecrã Inteiro</Text>
                </TouchableOpacity>
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
                        path="AdminDashboard"
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

    scroll: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 100, // height of the fixed header
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: theme.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: 60, // ⬅️ Increase this value to move content down
        paddingBottom: spacing.lg,
    },

    headerShadow: {
        shadowColor: theme.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 10, // Android shadow
    },
    welcome: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: theme.text,
        flexShrink: 1,
        marginRight: spacing.sm, // keeps spacing between text and profile pic
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
    map: {
        width: '92%',
        height: 250,
        borderRadius: 16,
        alignSelf: 'center',
        marginVertical: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.primary,
    },
    fullscreenMap: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1, // ensures the map stays behind the close button
    },
    fullscreenButton: {
        backgroundColor: theme.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },

    fullscreenText: {
        color: theme.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
