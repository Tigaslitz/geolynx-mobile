import React, {useEffect, useState} from 'react';
import { View, Picker, Button, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";

export default function ChangeRole({route, navigation}) {
    const {user} = route.params;
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const [role, setRole] = useState(user.role);

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    const handleSave = async () => {
        try {
            await api.put(`/users/${user.id}/role`, {role});
            Alert.alert('Sucesso', 'Role alterada');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível alterar role');
        }
    };

    return (
        <View style={styles.container}>
            <Picker selectedValue={role} onValueChange={setRole}>
                <Picker.Item label="User" value="USER"/>
                <Picker.Item label="Admin" value="SYSADMIN"/>
            </Picker>
            <Button title="Gravar" onPress={handleSave}/>
        </View>
    );
}

const getStyles = (theme) =>
 StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md
    }
});