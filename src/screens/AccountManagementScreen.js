import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function AccountManagement({ route, navigation }) {
    const { user } = route.params;
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{user.name}</Text>
            <Button title="Alterar Atributos" onPress={() => navigation.navigate('ChangeAttributes', { user })} />
            <Button title="Alterar Palavra-passe" onPress={() => navigation.navigate('ChangePassword', { user })} />
            <Button title="Alterar Role" onPress={() => navigation.navigate('ChangeRole', { user })} />
            <Button title="Pedir Remoção" onPress={() => navigation.navigate('AccountRemovalRequests', { user })} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.md, backgroundColor: colors.background },
    title: { fontSize: 24, marginBottom: spacing.lg, color: colors.text }
});
