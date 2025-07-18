import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default async function ChangePassword({route, navigation}) {
    console.log('ChangePassword');
    const {user} = route.params;
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
    const [password, setPassword] = useState('');

    const handleSave = async () => {
        try {
            await api.put(`/users/${user.id}/password`, {password});
            Alert.alert('Sucesso', 'Password alterada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível alterar password');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Nova password" secureTextEntry value={password}
                       onChangeText={setPassword}/>
            <Button title="Gravar" onPress={handleSave}/>
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