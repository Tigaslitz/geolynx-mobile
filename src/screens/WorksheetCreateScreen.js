import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default async function WorksheetCreate({navigation}) {
    console.log('WorksheetCreate');
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        try {
            await api.post('/worksheets', {title, description});
            Alert.alert('Sucesso', 'Ficha criada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível criar');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle}/>
            <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription}/>
            <Button title="Criar" onPress={handleCreate}/>
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
