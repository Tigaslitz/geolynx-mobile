import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";


export default async function WorksheetUpdate({route, navigation}) {
    console.log('WorksheetUpdate');
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
    const {worksheetId} = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/worksheets/${worksheetId}`)
            .then(res => {
                setTitle(res.data.title);
                setDescription(res.data.description);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleUpdate = async () => {
        try {
            await api.put(`/worksheets/${worksheetId}`, {title, description});
            Alert.alert('Sucesso', 'Ficha atualizada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível atualizar');
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{flex: 1, justifyContent: 'center'}}/>;

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={title} onChangeText={setTitle}/>
            <TextInput style={styles.input} value={description} onChangeText={setDescription}/>
            <Button title="Atualizar" onPress={handleUpdate}/>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md
    },

    input: {
        borderWidth: 1,
        padding: spacing.sm,
        marginBottom: spacing.md
    }
});
