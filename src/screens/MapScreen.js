import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { lightmode, darkmode} from '../theme/colors';
import {useUser} from "../contexts/UserContext";
import {getTheme} from "../services/GeneralFunctions";


export default async function MapScreen({route}) {
    console.log('MapScreen');
    const theme = (await getTheme()) === 'dark' ? darkmode : lightmode;
    const styles = getStyles(theme);
    const {latitude, longitude} = route.params;

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