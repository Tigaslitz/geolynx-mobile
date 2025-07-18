import React, {useEffect, useState} from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { spacing } from "../theme";
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default function RequestAccountRemoval({navigation}) {
    const {user} = useAuth();
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const handleRequest = async () => {
        setLoading(true);
        try {
            await api.post(`/users/${user.id}/removal-request`);
            Alert.alert('Sucesso', 'Pedido de remoção enviado');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível enviar pedido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button title={loading ? 'A processar...' : 'Pedir remoção de conta'} onPress={handleRequest}
                    disabled={loading}/>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.md
    }
});
