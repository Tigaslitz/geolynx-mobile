import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';

export default function ChangePassword({ route, navigation }) {
    const { user } = route.params;
    const [password, setPassword] = useState('');

    const handleSave = async () => {
        try {
            await api.put(`/users/${user.id}/password`, { password });
            Alert.alert('Sucesso', 'Password alterada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível alterar password');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Nova password" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title="Gravar" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.md },
    input: { borderWidth: 1, padding: spacing.sm, marginBottom: spacing.md }
});