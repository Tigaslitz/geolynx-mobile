import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ExecutionSheetContext = createContext();

export const useExecutionSheets = () => {
    const context = useContext(ExecutionSheetContext);
    if (!context) {
        throw new Error('useExecutionSheets must be used within an ExecutionSheetProvider');
    }
    return context;
};

export const ExecutionSheetProvider = ({ children }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Busca as folhas de execução atribuídas
    const getAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/execution-sheet/my-assignments');
            const executionSheets = response.data?.executionSheets || [];
            setAssignments(executionSheets);
            return executionSheets;
        } catch (error) {
            console.error('Erro ao obter execuções atribuídas:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Inicia uma atividade e atualiza o contexto em seguida
    const startActivity = async ({ executionSheetId, polygonId, operationId }) => {
        try {
            console.log("aqui");
            await api.post('/execution-sheet/start-activity', { executionSheetId, polygonId, operationId });
            console.log("aqui2");
            return { success: true, message: 'Atividade iniciada com sucesso' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Erro inesperado ao iniciar atividade',
            };
        }
    };

    // Termina uma atividade e atualiza o contexto em seguida
    const stopActivity = async ({ executionSheetId, polygonId, operationId }) => {
        try {
            console.log("aqui3");
            await api.post('/execution-sheet/stop-activity', { executionSheetId, polygonId, operationId });
            console.log("aqui4");
            return { success: true };
        } catch (error) {
            console.error('Erro ao parar atividade:', error);
            return { success: false, error: error.response?.data?.message };
        }
    };

    const value = {
        assignments,
        loading,
        getAssignments,
        startActivity,
        stopActivity,
    };

    return (
        <ExecutionSheetContext.Provider value={value}>
            {children}
        </ExecutionSheetContext.Provider>
    );
};

