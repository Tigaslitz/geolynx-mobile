import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const MapContext = createContext();

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) throw new Error('useMap must be used within a MapProvider');
    return context;
};

export const MapProvider = ({ children }) => {
    const [animalsSet, setAnimals] = useState([]);
    const [historicalCuriositiesSet, setHistoricalCuriosities] = useState([]);

    const fetchAnimalsByGeohash = async (geohash) => {
        try {
            const response = await api.get(`/animal/nearby`, {
                params: { geohash }
            });
            setAnimals(response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar animais:', error);
        }
    };

    const fetchHistoricalCuriositiesByGeohash = async (geohash) => {
        try {
            const response = await api.get(`/historical-curiosities/nearby`, {
                params: { geohash }
            });
            setHistoricalCuriosities(response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar curiosidades:', error);
        }
    };

    const uploadAnimal = async ({ name, description, latitude, longitude }) => {
        try {
            const payload = { name:name, description:description, latitude:latitude, longitude:longitude };
            const response = await api.post('/animal/', payload);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao enviar animal:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro inesperado ao enviar animal'
            };
        }
    };

    const uploadHistoricalCuriosity = async ({ title, description, latitude, longitude }) => {
        try {
            const payload = { title, description, latitude, longitude };
            const response = await api.post('/historical-curiosities/', payload);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao enviar curiosidade histórica:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erro inesperado ao enviar curiosidade'
            };
        }
    };

    return (
        <MapContext.Provider
            value={{
                animalsSet,
                historicalCuriositiesSet,
                fetchAnimalsByGeohash,
                fetchHistoricalCuriositiesByGeohash,
                uploadAnimal,
                uploadHistoricalCuriosity,
            }}
        >
            {children}
        </MapContext.Provider>
    );
};