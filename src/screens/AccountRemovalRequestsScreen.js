import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { spacing } from '../theme';
import { colors, lightmode, darkmode} from '../theme/colors';
import {getTheme} from "../services/GeneralFunctions";
import {useUser} from "../contexts/UserContext";

export default async function AccountRemovalRequests() {
  console.log('AccountRemovalRequests');
  const {user} = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
  const styles = getStyles(theme);

  useEffect(() => {
    api.get('/removal-requests')
        .then(res => setRequests(res.data))
        .finally(() => setLoading(false));
  }, []);

  return (
      <View style={styles.container}>
        {loading ? <ActivityIndicator size="large" color={theme.primary}/> : (
            <FlatList
                data={requests}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <View style={styles.item}>
                      <Text>{item.userName}</Text>
                      <Button title="Aprovar" onPress={() => {
                      }}/>
                    </View>
                )}
            />
        )}
      </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: theme.background
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderColor: theme.surface
  }
});