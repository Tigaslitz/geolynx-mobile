import React, {useEffect, useState} from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { lightmode, darkmode} from '../theme/colors';
import {useUser} from "../contexts/UserContext";
import {getTheme} from "../services/GeneralFunctions";


export default function MapScreen({route}) {
    const [theme, setTheme] = useState(lightmode);
    const styles = getStyles(theme);
    const {latitude, longitude} = route.params;

    useEffect(() => {
        const loadTheme = async () => {
            const themeMode = await getTheme();
            setTheme(themeMode === 'dark' ? darkmode : lightmode);
        };
        loadTheme();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}          // <-- assegura um provider suportado
                style={styles.map}
                initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={{latitude, longitude}}/>
            </MapView>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1
    },

    map: {
        flex: 1
    }
});