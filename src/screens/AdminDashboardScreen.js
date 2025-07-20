import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Alert, BackHandler} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Title,
  Paragraph,
  Button,
  DataTable,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useUser } from "../contexts/UserContext";
import { useWorkSheets } from "../contexts/WorkSheetContext";
import {darkmode, lightmode} from "../theme/colors";
import {getTheme} from "../services/GeneralFunctions";
import {useFocusEffect} from "@react-navigation/native";

export default function AdminDashboard({ navigation }) {
  const { listUsers, getAccountsForRemoval, listActiveUsers } = useUser();
  const { fetchWorkSheets } = useWorkSheets();
  const [theme, setTheme] = useState(lightmode);
  const styles = getStyles(theme);

  useEffect(() => {
    const loadTheme = async () => {
      const themeMode = await getTheme();
      setTheme(themeMode === 'dark' ? darkmode : lightmode);
    };
    loadTheme();
  }, []);

  useFocusEffect(
      useCallback(() => {
        fetchDashboardData();
      }, [])
  );
  useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          navigation.navigate('Home'); // ou o nome correto da tua HomeScreen
          return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }, [navigation])
  );

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingRemoval: 0,
    totalWorksheets: 0,
  });
  const [allUsers, setAllUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [removalRequests, setRemovalRequests] = useState([]);
  const [error, setError] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllRemovals, setShowAllRemovals] = useState(false);
  const recentRemovals = removalRequests.slice(0, 3);

  // refs para scroll
  const scrollRef = useRef(null);
  const usersSectionY = useRef(0);
  const removalSectionY = useRef(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const all = (await listUsers()) || [];
      const removal = (await getAccountsForRemoval()) || [];
      const worksheets = (await fetchWorkSheets()) || [];
      const active = (await listActiveUsers()) || [];

      setStats({
        totalUsers: all.length,
        activeUsers: active.length,
        pendingRemoval: removal.length,
        totalWorksheets: worksheets.length,
      });
      setAllUsers(all);
      setRecentUsers(all.slice(0, 5));
      setRemovalRequests(removal);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'SUSPENDED': return 'orange';
      case 'PENDING_REMOVAL': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'SUSPENDED': return 'Suspenso';
      case 'PENDING_REMOVAL': return 'Remoção Pendente';
      default: return status;
    }
  };

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
    );
  }

  if (error) {
    Alert.alert('Erro', error, [{ text: 'OK', onPress: () => setError(null) }]);
  }

  // dados para mostrar
  const displayedUsers = showAllUsers ? allUsers : recentUsers;
  const usersTitle = showAllUsers ? 'Todos os Utilizadores' : 'Utilizadores Recentes';

  // handlers para scroll + toggle
  const handleShowAllUsers = () => {
    setShowAllUsers(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: usersSectionY.current, animated: true });
    }, 100);
  };

  const handleManageRemovals = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: removalSectionY.current, animated: true });
    }, 100);
  };
  const handleUserListToggle = () => {
    setShowAllUsers(false);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: usersSectionY.current, animated: true });
    }, 100);
  };


  return (
      <ScrollView ref={scrollRef} style={styles.container}>
        <Title style={styles.title}>Dashboard Administrativo</Title>

        {/* Cards de Estatísticas */}
        <View style={styles.cardsRow}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View>
                <Paragraph>Total de Utilizadores</Paragraph>
                <Title>{stats.totalUsers}</Title>
              </View>
              <IconButton icon="account-group" size={36} disabled />
            </Card.Content>
            <Card.Actions>
              <Button onPress={handleShowAllUsers}>Ver Todos</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View>
                <Paragraph>Utilizadores Ativos</Paragraph>
                <Title>{stats.activeUsers}</Title>
              </View>
              <IconButton icon="check-circle" size={36} disabled color="green" />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View>
                <Paragraph>Pedidos de Remoção</Paragraph>
                <Title>{stats.pendingRemoval}</Title>
              </View>
              <IconButton icon="alert-circle" size={36} disabled color="red" />
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('AccountRemovalRequests')}> Gerir </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View>
                <Paragraph>Folhas de Obra</Paragraph>
                <Title>{stats.totalWorksheets}</Title>
              </View>
              <IconButton icon="file-document" size={36} disabled />
            </Card.Content>
          </Card>
        </View>

        {/* Seção de Utilizadores */}
        <View
            onLayout={e => { usersSectionY.current = e.nativeEvent.layout.y; }}
        >
          <Title style={styles.sectionTitle}>{usersTitle}</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Nome</DataTable.Title>
              <DataTable.Title>Email</DataTable.Title>
              <DataTable.Title>Role</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Ações</DataTable.Title>
            </DataTable.Header>

            {displayedUsers.map(u => (
                <DataTable.Row key={u.id}>
                  <DataTable.Cell>{u.personalInfo?.fullName || u.username}</DataTable.Cell>
                  <DataTable.Cell>{u.email}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip>{u.role}</Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip style={{ backgroundColor: getStatusColor(u.accountStatus) }}>
                      {getStatusLabel(u.accountStatus)}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.actionsCell}>
                    <IconButton
                        icon="cog"
                        size={20}
                        onPress={() => navigation.navigate('AdminAccountManagement', { userId: u.email })}
                    />
                    <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => navigation.navigate('ChangeAttributes', { userId: u.id })}
                    />
                  </DataTable.Cell>
                </DataTable.Row>
            ))}
          </DataTable>

          {!showAllUsers && (
              <Button mode="text" onPress={handleShowAllUsers}>
                Ver Todos ▼
              </Button>
          )}

          {showAllUsers && (
              <Button mode="text" onPress={handleUserListToggle}>
                Fechar ▲
              </Button>
          )}
        </View>

        {/* Seção de Pedidos de Remoção */}
        {removalRequests.length > 0 && (
            <View
                onLayout={e => { removalSectionY.current = e.nativeEvent.layout.y; }}
            >
              <Title style={styles.sectionTitle}>Pedidos de Remoção Pendentes</Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Utilizador</DataTable.Title>
                  <DataTable.Title>Email</DataTable.Title>
                  <DataTable.Title>Role</DataTable.Title>
                  <DataTable.Title>Ações</DataTable.Title>
                </DataTable.Header>
                {(showAllRemovals ? removalRequests : recentRemovals).map(r => (
                    <DataTable.Row key={r.id}>
                      <DataTable.Cell>{r.personalInfo?.fullName || r.username}</DataTable.Cell>
                      <DataTable.Cell>{r.email}</DataTable.Cell>
                      <DataTable.Cell>{r.role}</DataTable.Cell>
                      <DataTable.Cell>
                        <Button
                            compact
                            mode="contained"
                            onPress={() => navigation.navigate('AccountRemovalRequests')}
                        >
                          Processar
                        </Button>
                      </DataTable.Cell>
                    </DataTable.Row>
                ))}
              </DataTable>

              {!showAllRemovals && removalRequests.length > 3 && (
                  <Button mode="text" onPress={() => setShowAllRemovals(true)}>
                    Ver Todos ▼
                  </Button>
              )}

              {showAllRemovals && (
                  <Button mode="text" onPress={() => setShowAllRemovals(false)}>
                    Fechar ▲
                  </Button>
              )}
            </View>
        )}
      </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 16 },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 12 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { marginTop: 24, marginBottom: 8 },
  actionsCell: { flexDirection: 'row' },
});
