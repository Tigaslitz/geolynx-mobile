import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';

export default function WorksheetCreate({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async () => {
        try {
            await api.post('/worksheets', { title, description });
            Alert.alert('Sucesso', 'Ficha criada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível criar');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
            <Button title="Criar" onPress={handleCreate} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md }, input: { borderWidth: 1, padding: spacing.sm, marginBottom: spacing.md } });
