import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";

export async function startupTheme() {
    let theme = Appearance.getColorScheme();
    await SecureStore.setItemAsync('mobile_geolynx_theme', theme);
    return theme;
}

export async function getTheme(){
    let theme = "light";
    try {
        theme = await SecureStore.getItemAsync('mobile_geolynx_theme');
    } catch(Exception){
        console.log("Color scheme loading error, auto-setting to light mode.")
    }
    return theme;
}

export async function changeTheme(newTheme){
    if((newTheme === 'light') || (newTheme === 'dark')) {
        await SecureStore.setItemAsync('mobile_geolynx_theme', newTheme);
    }
}

export async function logoutTheme(){
    await SecureStore.deleteItemAsync('mobile_geolynx_theme');
}