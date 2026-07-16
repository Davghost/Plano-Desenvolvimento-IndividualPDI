// src/composables/usePushNotifications.js
import { ref } from "vue";
//maybe "firebase/messaging"
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported } from "../firebase/config.js";
import api from "@/services/api"; // sua instância axios configurada

export function usePushNotifications() {
  const permissionState = ref(Notification.permission); // "default" | "granted" | "denied"
  const fcmToken = ref(null);
  const error = ref(null);

  async function enableNotifications() {
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        error.value = "Este navegador não suporta notificações push.";
        return;
      }

      const permission = await Notification.requestPermission();
      permissionState.value = permission;

      if (permission !== "granted") {
        error.value = "Permissão de notificação negada.";
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("debug")
      console.log(token)

      if (!token) {
        error.value = "Não foi possível gerar o token de notificação.";
        return;
      }

      fcmToken.value = token;

      // Envia o token para o backend salvar no banco (via Prisma)
      await api.post(
        "api/push/register-token", 
        { token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pdi_token")}`
          }
        }
      );

      // Notificações recebidas com o app aberto (foreground)
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        // Aqui você pode usar seu próprio sistema de toast/snackbar
        new Notification(title, { body });
      });
    } catch (err) {
      console.error(err);
      error.value = err.message;
    }
  }

  return { permissionState, fcmToken, error, enableNotifications };
}