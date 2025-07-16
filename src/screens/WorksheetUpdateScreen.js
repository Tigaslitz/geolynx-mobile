import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';

export default function WorksheetUpdate({ route, navigation }) {
    const { worksheetId } = route.params;
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
            await api.put(`/worksheets/${worksheetId}`, { title, description });
            Alert.alert('Sucesso', 'Ficha atualizada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível atualizar');
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} value={description} onChangeText={setDescription} />
            <Button title="Atualizar" onPress={handleUpdate} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md }, input: { borderWidth: 1, padding: spacing.sm, marginBottom: spacing.md } });
