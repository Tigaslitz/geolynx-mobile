// File: src/App.js
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
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
import {UserProvider} from "./src/contexts/UserContext";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <UserProvider>
                        <NavigationContainer>
                            <Stack.Navigator
                                initialRouteName="Login"
                                screenOptions={{ headerShown: false }}
                            >
                                {/* Rota pública */}
                                <Stack.Screen name="Login" component={Login} />
                                <Stack.Screen name="Register" component={Register} />

                                {/* Rotas privadas (uso de AuthContext para proteger) */}
                                <Stack.Screen name="Home" component={Home} />
                                <Stack.Screen name="ListUsers" component={ListUsers} />
                                <Stack.Screen name="Profile" component={Profile} />
                                <Stack.Screen name="AccountManagement" component={AccountManagement}/>
                                <Stack.Screen name="AccountRemovalRequests" component={AccountRemovalRequests}/>
                                <Stack.Screen name="ChangeAttributes" component={ChangeAttributes} />
                                <Stack.Screen name="ChangePassword" component={ChangePassword} />
                                <Stack.Screen name="ChangeRole" component={ChangeRole} />
                                <Stack.Screen name="Map" component={MapScreen} />
                                <Stack.Screen name="RequestAccountRemoval" component={RequestAccountRemoval}/>
                                <Stack.Screen name="WorksheetCreate" component={WorksheetCreate} />
                                <Stack.Screen name="WorksheetUpdate" component={WorksheetUpdate} />

                                {/* Rota catch-all */}
                                <Stack.Screen name="NotFound" component={NotFound} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </UserProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

