import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const WorkSheetContext = createContext();

export const useWorkSheets = () => {
    const context = useContext(WorkSheetContext);
    if (!context) throw new Error('useWorkSheets must be used within a WorkSheetProvider');
    return context;
};

export const WorkSheetProvider = ({ children }) => {
    const [worksheets, setWorkSheets] = useState([]);
    const [currentSheet, setCurrentSheet] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchWorkSheets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/work-sheet/');
            setWorkSheets(response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar folhas de obra:', error);
        } finally {
            setLoading(false);
        }
    };
    const getWorkSheetById = async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/work-sheet/${id}`);
            setCurrentSheet(response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar folha ${id}:`, error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveWorkSheet = async (sheet) => {
        setLoading(true);
        try {
            await api.post('/work-sheet/import', sheet);
            return { success: true };
        } catch (error) {
            console.error('Erro ao guardar folha:', error);
            return { success: false, error: error.response?.data?.message };
        } finally {
            setLoading(false);
        }
    };


    //useEffect(() => {
        //fetchWorkSheets();
    //}, []);

    const value = {
        worksheets,
        loading,
        currentSheet,
        fetchWorkSheets,
        getWorkSheetById,
        saveWorkSheet,
    };

    return (
        <WorkSheetContext.Provider value={value}>
            {children}
        </WorkSheetContext.Provider>
    );
};