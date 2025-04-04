import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid,Platform} from 'react-native';
import notifee, { AndroidImportance , AndroidVisibility, AndroidBadgeIconType, EventType} from '@notifee/react-native';
import { navigate } from './navigationRef';

export async function requestUserPermission() {

    console.log("PermissionsAndroid.RESULTS.granted",PermissionsAndroid.RESULTS.GRANTED)
    if(Platform.OS == 'android' && Platform.Version >= 33){
    const granted =  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    console.log("grantedgranted",granted)
    if(granted === PermissionsAndroid.RESULTS.GRANTED){
        getFCMToken()
    }else{
        console.log("permission denied")
    }
    }else{
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
        if (enabled) {
          console.log('Authorization status:', authStatus);
          getFCMToken()
        }
    }
}

export const getFCMToken = async() =>{
    try {
        await messaging().registerDeviceForRemoteMessages();
        let fcmToken = await AsyncStorage.getItem('fcm_token')
        if(!!fcmToken){
           console.log("OLD FCM_TOKEN FOUND",fcmToken) 
        }else{
            const token = await messaging().getToken();
            await AsyncStorage.setItem('fcm_token', token)
            console.log("NEW FCM_TOKEN",token) 
        }
    } catch (error) {
        console.log("error during generating token",error)
    }
}

export const createDefaultChannel = async() => {
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        sound: 'default',
        badgeIconType: AndroidBadgeIconType.LARGE,
        badgeIcon: 'ic_launcher',
    })
}

export const handleNotifeeNotification = async() => {
    notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('Notification Pressed', detail.notification);
            // Handle the notification press event here
            navigate('Notice');
        }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            navigate('Notice');
        }
    });
}