import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import {logoutTheme} from "../services/GeneralFunctions";

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Utilizador não encontrado:', error);
        } finally {
            setLoading(false);
        }
    };
    const getUserById = async (userId) => {
        try {
            const response = await api.get(`/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Utilizador não encontrado:', error);
        } finally {
            setLoading(false);
        }
    };

    const listUsers = async () => {
        try {
            const response = await api.get('/user/all');
            return response.data;
        }catch (error) {
            console.error('Erro ao listar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    }

    const listActiveUsers = async () => {
        try {
            const response = await api.get('/user/list-accs/active');
            return response.data;
        }catch (error) {
            console.error('Erro ao listar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    }
    const removeUser = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            const response = await api.post('/user/remove',payload);
            return response.data;
        }catch (error) {
            console.error('Erro ao listar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    }


    const getAccountsForRemoval = async () => {
        try {
            const response = await api.post('/user/accounts-for-removal');
            return response.data;
        }catch (error) {
            console.error('Erro ao listar utilizadores:', error);
        } finally {
            setLoading(false);
        }
    }
    const getAccountStatus = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            const response = await api.post('/user/account-status', payload);
            return response.data;
        }catch (error) {
            console.error('Erro ao obter estado do utilizador:', error);
        } finally {
            setLoading(false);
        }
    }
    const activateAccount = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            return await api.post('/user/activate',payload);
        }catch (error) {
            console.error('Erro ao ativar utilizador:', error);
        } finally {
            setLoading(false);
        }
    }
    const deactivateAccount = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            return await api.post('/user/deactivate',payload);
            console.log("pimple ", response.data);
        }catch (error) {
            console.error('Erro ao desativar utilizador:', error);
        } finally {
            setLoading(false);
        }
    }
    const suspendAccount = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            return await api.post('/user/suspend',payload);
        }catch (error) {
            console.error('Erro ao suspender utilizador:', error);
        } finally {
            setLoading(false);
        }
    }
    const requestAccountRemoval = async (id) => {
        try {
            const payload = {
                identificador: id,
            };
            return await api.post('/user/request-removal',payload);
        }catch (error) {
            console.error('Erro ao pedir remoção de conta do utilizador:', error);
        } finally {
            setLoading(false);
        }
    }

    const hasRole = (role) => {
        return user?.role === role;
    };

    const hasPermission = (permission) => {
        // Exemplo: lógica baseada em role
        if (!user) return false;
        const permissionsMap = {
            SYSADMIN: ['MANAGE_USERS', 'VIEW_ALL'],
            USER: ['VIEW_SELF'],
        };
        return permissionsMap[user.role]?.includes(permission);
    };

    const updateUser = async (user, updatedFields) => {
        try {
            const payload = {
                identificador: user.email,
                atributos: updatedFields,
            };
            const response = await api.post('/user/change-attributes', payload);

            // Atualizar localmente o estado com os dados modificados
            setUser((prev) => ({ ...prev, ...updatedFields }));
            const refreshedUser = await getUser();

            return { success: true, data: refreshedUser };
        } catch (error) {
            console.error('Erro ao atualizar atributos do utilizador:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro inesperado ao atualizar os dados',
            };
        }
    };

    const deleteUser = async (user) => {
        try{
            await logoutTheme();
            const payload = {
                identificador: user.email,
            };
            const response = await api.post('/user/remove', payload);

            return { success: true, data: refreshedUser };
        } catch (error) {
            console.error('Erro ao apagar utilizador:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro inesperado ao apagar utilizador',
            };
        }
    };

    //useEffect(() => {
        //getUser();
    //}, []);

    const value = {
        user,
        setUser,
        loading,
        getUserById,
        removeUser,
        getAccountStatus,
        activateAccount,
        deactivateAccount,
        suspendAccount,
        requestAccountRemoval,
        getUser,
        getAccountsForRemoval,
        updateUser,
        listActiveUsers,
        deleteUser,
        hasRole,
        hasPermission,
        listUsers,
    };
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
};