import React from 'react';
import {ActivityIndicator, View,StyleSheet} from "react-native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {UserProvider} from "./src/contexts/UserContext";
import {MapProvider} from "./src/contexts/MapContext";
import { WorkSheetProvider } from './src/contexts/WorkSheetContext';
import {ExecutionSheetProvider} from "./src/contexts/ExecutionSheetContext";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import roleScreens from './src/components/roleScreens';

// Screens (convert cada página web num screen React Native)
import Login from './src/screens/LoginScreen';
import Register from './src/screens/RegisterScreen';
import Home from './src/screens/HomeScreen';
import ListUsers from './src/screens/ListUsersScreen';
import AccountManagement from './src/screens/AccountManagementScreen';
import Profile from './src/screens/ProfileScreen'
import AccountRemovalRequests from './src/screens/AccountRemovalRequestsScreen';
import ChangeAttributes from './src/screens/ChangeAttributesScreen';
import ChangePassword from './src/screens/ChangePasswordScreen';
import ChangeRole from './src/screens/ChangeRoleScreen';
import MapScreen from './src/screens/MapScreen';
import RequestAccountRemoval from './src/screens/RequestAccountRemovalScreen';
import WorksheetCreate from './src/screens/WorksheetCreateScreen';
import WorksheetUpdate from './src/screens/WorksheetUpdateScreen';
import NotFound from './src/screens/NotFoundScreen';
import WorkSheetList from "./src/screens/WorkSheetListScreen";
import WorkSheet from "./src/screens/WorkSheetScreen";
import OperationsScreen from './src/screens/OperationsScreen';
import ExecutionSheetsScreen from './src/screens/ExecutionSheetsScreen';
import ExecutionSheetDetailScreen from "./src/screens/ExecutionSheetDetailScreen";
import ExecutionOperationScreen from "./src/screens/ExecutionOperationScreen";
import PolygonOperationScreen from "./src/screens/PolygonOperationScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import UserManualScreen from "./src/screens/UserManualScreen";
import AdminDashboard from "./src/screens/AdminDashboardScreen"
import AdminAccountManagement from "./src/screens/AdminAccountManagementScreen"

// 3. Função para filtrar screens
function getScreensForRole(role) {
    return roleScreens[role] || [];
}

export default function App() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <AuthProvider>
                    <WorkSheetProvider>
                        <ExecutionSheetProvider>
                            <NavigationContainer>
                                <MapProvider>
                                    <AppNavigator/>
                                </MapProvider>
                            </NavigationContainer>
                        </ExecutionSheetProvider>
                    </WorkSheetProvider>
                </AuthProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}

function AppNavigator() {
    const { loading, isAuthenticated, user } = useAuth();
    if (loading) return <LoadingSpinner />;
    const Stack = createNativeStackNavigator();

    if (!isAuthenticated) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
        );
    }

    // Verifique se user e user.role existem
    const allowedScreens = user && user.role ? getScreensForRole(user.role) : [];

    const screenComponents = {
        Home, ListUsers, Profile, AccountManagement, AccountRemovalRequests,
        ChangeAttributes, ChangePassword, ChangeRole, Map: MapScreen, RequestAccountRemoval,
        WorksheetCreate, WorksheetUpdate, WorkSheetList, WorkSheet, Operations: OperationsScreen,
        ExecutionSheets: ExecutionSheetsScreen, ExecutionSheetDetail: ExecutionSheetDetailScreen,
        ExecutionOperation: ExecutionOperationScreen, PolygonOperation: PolygonOperationScreen,
        SettingsScreen, UserManualScreen, AdminDashboard,AdminAccountManagement
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {allowedScreens.map(screenName =>
                screenComponents[screenName] &&
                <Stack.Screen key={screenName} name={screenName} component={screenComponents[screenName]} />
            )}
            <Stack.Screen name="NotFound" component={NotFound} />
        </Stack.Navigator>
    );
}
function LoadingSpinner() {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" />
        </View>
    );
}
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

