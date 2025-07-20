import axios from 'axios';
import Constants from 'expo-constants';

// No SDK 49 e acima, use expoConfig.extra em vez de manifest.extra
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://glass-gasket-463218-j2.ew.r.appspot.com/api';

// Create axios instance with default config
const api = axios.create({
    //baseURL: '/api',
    baseURL: Constants.expoConfig?.extra?.apiUrl,
    withCredentials: true, // This ensures cookies are sent with requests
    headers: { 'Content-Type': 'application/json' },
});


export default api;
