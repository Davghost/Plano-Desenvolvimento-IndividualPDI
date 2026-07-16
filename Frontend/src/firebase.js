import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {

apiKey: "AIzaSyC-UxV0Qjxna-LVp7tebPffY7zMwXIVVB0",
authDomain: "planodesenvolvimentoindividual.firebaseapp.com",
projectId: "planodesenvolvimentoindividual",
storageBucket: "planodesenvolvimentoindividual.firebasestorage.app",
messagingSenderId: "668250518522",
appId: "1:668250518522:web:a730657126d39f5ced6a43",
measurementId: "G-5123GSM42H"

};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function registrarPush(apiBaseUrl, authToken) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: " BA0I6AXYLn6jR_Pf8x5VU10Ti_l23H6jpnsvWh7PHrJOBbLwfst5BdKBjhHYrN1pXHc2FNdHh4w4SkGNK_7E6CI"
    });

    if (token) {
      await fetch(`${apiBaseUrl}/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ token, platform: "web" })
      });
    }
  } catch (err) {
    console.error("Erro ao registrar push:", err);
  }
}

onMessage(messaging, (payload) => {
  console.log("Notificação recebida em foreground:", payload);
});