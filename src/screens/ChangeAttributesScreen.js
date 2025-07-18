import React, {useEffect, useState} from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default function ChangeAttributes({route, navigation}) {
    const {user} = route.params;
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [name, setName] = useState(user.name);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const handleSave = async () => {
        try {
            await api.put(`/users/${user.id}`, {name});
            Alert.alert('Sucesso', 'Atributos atualizados');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível atualizar');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={name} onChangeText={setName}/>
            <Button title="Gravar" onPress={handleSave}/>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding:
        spacing.md
    },

    input: {
        borderWidth: 1,
        padding: spacing.sm,
        marginBottom: spacing.md
    }
});