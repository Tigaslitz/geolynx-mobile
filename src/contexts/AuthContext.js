import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import {useUser} from "./UserContext";
import {logoutTheme} from "../services/GeneralFunctions";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const {user, setUser, getUser} = useUser();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const check = await getUser();
                if (check) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false); // caso inesperado
                }
            } catch (error) {
                setIsAuthenticated(false); // se getUser lançar erro
            } finally {
                setLoading(false); // só aqui deves fazer o setLoading
            }
        };

        loadUser();
    }, []);



    const login = async (email, password) => {
        try {
            await api.post('/user/login', { email, password });
            await getUser();
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Credenciais inválidas',
            };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/user/register', userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro no registo',
            };
        }
    };

    const logout = async () => {
        try {
            await logoutTheme();
            await api.post('/user/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        mockUsers: [],
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
