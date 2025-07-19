import React from 'react';
import {ActivityIndicator, View,StyleSheet} from "react-native";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import {UserProvider} from "./src/contexts/UserContext";
import { WorkSheetProvider } from './src/contexts/WorkSheetContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import SettingsScreen from "./src/screens/SettingsScreen";
import UserManualScreen from "./src/screens/UserManualScreen";


export default function App() {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <AuthProvider>
                    <WorkSheetProvider>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </WorkSheetProvider>
                </AuthProvider>
            </UserProvider>
        </QueryClientProvider>
    );
}

function AppNavigator() {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />
    }
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <>
                    {/* Rotas privadas */}
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="ListUsers" component={ListUsers} />
                    <Stack.Screen name="Profile" component={Profile} />
                    <Stack.Screen name="AccountManagement" component={AccountManagement} />
                    <Stack.Screen name="AccountRemovalRequests" component={AccountRemovalRequests} />
                    <Stack.Screen name="ChangeAttributes" component={ChangeAttributes} />
                    <Stack.Screen name="ChangePassword" component={ChangePassword} />
                    <Stack.Screen name="ChangeRole" component={ChangeRole} />
                    <Stack.Screen name="Map" component={MapScreen} />
                    <Stack.Screen name="RequestAccountRemoval" component={RequestAccountRemoval} />
                    <Stack.Screen name="WorksheetCreate" component={WorksheetCreate} />
                    <Stack.Screen name="WorksheetUpdate" component={WorksheetUpdate} />
                    <Stack.Screen name="WorkSheetList" component={WorkSheetList} />
                    <Stack.Screen name="WorkSheet" component={WorkSheet} />
                    <Stack.Screen name="OperationsScreen" component={OperationsScreen} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                    <Stack.Screen name="UserManualScreen" component={UserManualScreen}/>
                </>
            ) : (
                <>
                    {/* Rotas públicas */}
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                </>
            )}
            {/* Rota catch-all */}
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

