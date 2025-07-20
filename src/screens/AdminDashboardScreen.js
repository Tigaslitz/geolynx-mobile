// AdminDashboardScreen.js com ajustes visuais finais
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useWorkSheets } from '../contexts/WorkSheetContext';
import { getTheme } from '../services/GeneralFunctions';
import { darkmode, lightmode } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme';

export default function AdminDashboard({ navigation }) {
  const { listUsers, getAccountsForRemoval, listActiveUsers } = useUser();
  const { fetchWorkSheets } = useWorkSheets();
  const [theme, setTheme] = useState(lightmode);
  const styles = getStyles(theme);

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
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllRemovals, setShowAllRemovals] = useState(false);

  const scrollRef = useRef(null);
  const usersSectionY = useRef(0);
  const removalSectionY = useRef(0);

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
          navigation.navigate('Home');
          return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }, [navigation])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const all = await listUsers();
      const removal = await getAccountsForRemoval();
      const worksheets = await fetchWorkSheets();
      const active = await listActiveUsers();

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
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (ref) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: ref.current, animated: true });
    }, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ATIVADA': return '#16a34a';
      case 'SUSPENSA': return '#f97316';
      case 'A_REMOVER': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'SUSPENDED': return 'Suspenso';
      case 'PENDING_REMOVAL': return 'Remoção Pendente';
      default: return status;
    }
  };

  const StatCard = ({ title, count, icon, color, onPress, showButton, buttonLabel }) => (
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardNumber}>{count}</Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Text style={styles.cardIcon}>{icon}</Text>
          </View>
        </View>
        {showButton && (
            <TouchableOpacity onPress={onPress} style={styles.cardButton}>
              <Text style={styles.cardButtonText}>{buttonLabel}</Text>
            </TouchableOpacity>
        )}
      </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  const displayedUsers = showAllUsers ? allUsers : recentUsers;
  const usersTitle = showAllUsers ? 'Todos os Utilizadores' : 'Utilizadores Recentes';

  return (
      <ScrollView ref={scrollRef} style={styles.container}>
        <Text style={styles.title}>Dashboard Administrativo</Text>

        <View style={styles.cardsRow}>
          <StatCard
              title="Total de Utilizadores"
              count={stats.totalUsers}
              icon="👥"
              color="#3b82f6"
              onPress={() => {
                setShowAllUsers(true);
                scrollTo(usersSectionY);
              }}
              showButton={true}
              buttonLabel="Ver Todos"
          />
          <StatCard
              title="Utilizadores Ativos"
              count={stats.activeUsers}
              icon="✅"
              color="#16a34a"
          />
          <StatCard
              title="Pedidos de Remoção"
              count={stats.pendingRemoval}
              icon="⚠️"
              color="#dc2626"
              onPress={() => navigation.navigate('AccountRemovalRequests')}
              showButton={true}
              buttonLabel="Gerir"
          />
          <StatCard
              title="Folhas de Obra"
              count={stats.totalWorksheets}
              icon="📄"
              color="#0ea5e9"
          />
        </View>

        <View onLayout={(e) => (usersSectionY.current = e.nativeEvent.layout.y)}>
          <Text style={styles.sectionTitle}>{usersTitle}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>Nome</Text>
            <Text style={styles.th}>Email</Text>
            <Text style={styles.th}>Role</Text>
            <Text style={styles.th}>Status</Text>
            <Text style={styles.th}>Ações</Text>
          </View>
          {displayedUsers.map((u) => (
              <View key={u.id} style={styles.tableRow}>
                <Text style={styles.td}>{u.personalInfo?.fullName || u.username}</Text>
                <Text style={styles.td}>{u.email}</Text>
                <Text style={styles.td}>{u.role}</Text>
                <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(u.accountStatus) }]}>
                  {getStatusLabel(u.accountStatus)}
                </Text>
                <View style={styles.actionsCell}>
                  <TouchableOpacity onPress={() => navigation.navigate('AdminAccountManagement', { userId: u.email })}>
                    <Text style={styles.actionButton}>⚙️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ChangeAttributes', { userId: u.id })}>
                    <Text style={styles.actionButton}>✏️</Text>
                  </TouchableOpacity>
                </View>
              </View>
          ))}
          {allUsers.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllUsers(!showAllUsers)}>
                <Text style={styles.toggleBtn}>{showAllUsers ? 'Fechar ▲' : 'Ver Todos ▼'}</Text>
              </TouchableOpacity>
          )}
        </View>

        {removalRequests.length > 0 && (
            <View onLayout={(e) => (removalSectionY.current = e.nativeEvent.layout.y)}>
              <Text style={styles.sectionTitle}>Pedidos de Remoção Pendentes</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.th}>Utilizador</Text>
                <Text style={styles.th}>Email</Text>
                <Text style={styles.th}>Role</Text>
                <Text style={styles.th}>Ações</Text>
              </View>
              {(showAllRemovals ? removalRequests : removalRequests.slice(0, 3)).map((r) => (
                  <View key={r.id} style={styles.tableRow}>
                    <Text style={styles.td}>{r.personalInfo?.fullName || r.username}</Text>
                    <Text style={styles.td}>{r.email}</Text>
                    <Text style={styles.td}>{r.role}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AccountRemovalRequests')}>
                      <Text style={[styles.statusBadge, { backgroundColor: '#dc2626' }]}>Processar</Text>
                    </TouchableOpacity>
                  </View>
              ))}
              {removalRequests.length > 3 && (
                  <TouchableOpacity onPress={() => setShowAllRemovals(!showAllRemovals)}>
                    <Text style={styles.toggleBtn}>{showAllRemovals ? 'Fechar ▲' : 'Ver Todos ▼'}</Text>
                  </TouchableOpacity>
              )}
            </View>
        )}
      </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center' },
  cardsRow: { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: theme.surface,
    borderLeftWidth: 5,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, color: theme.text, marginBottom: 4 },
  cardNumber: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  cardIcon: { fontSize: 24, color: '#fff' },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButton: {
    marginTop: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  cardButtonText: {
    color: theme.primary,
    fontWeight: '600',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  th: { flex: 1, fontWeight: '600', fontSize: 12, color: theme.text },
  td: { flex: 1, fontSize: 12, color: theme.text },
  actionsCell: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' },
  actionButton: { fontSize: 16 },
  toggleBtn: { color: theme.primary, textAlign: 'center', marginVertical: 8 },
  statusBadge: {
    fontSize: 12,
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
  },
});
