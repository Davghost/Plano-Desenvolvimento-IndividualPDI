// src/composables/usePushNotifications.js
import { ref, onMounted } from "vue";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported } from "../firebase/config.js";
import api from "@/services/api"; // sua instância axios configurada
import { useToast } from "./useToast.js";

export function usePushNotifications() {
  const permissionState = ref(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
  const fcmToken = ref(null);
  const error = ref(null);
  const { showToast } = useToast();

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

      if (!token) {
        error.value = "Não foi possível gerar o token de notificação.";
        return;
      }

      fcmToken.value = token;

      // Envia o token para o backend salvar no banco se o usuário estiver logado
      const authToken = localStorage.getItem("pdi_token");
      if (authToken) {
        await api.post(
          "api/push/register-token", 
          { token },
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
      }

      // Notificações recebidas com o app aberto (foreground)
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {};
        showToast(title, body, "info");
      });
    } catch (err) {
      console.error(err);
      error.value = err.message;
    }
  }

  async function unregisterPushToken() {
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) return;

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        const authToken = localStorage.getItem("pdi_token");
        if (authToken) {
          await api.delete("api/push/unregister-token", {
            data: { token },
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          });
        }
      }
    } catch (err) {
      console.error("Erro ao remover token no logout:", err);
    }
  }

  // Se a permissão já foi concedida, inicializa o registro e a escuta automaticamente ao montar
  onMounted(async () => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      await enableNotifications();
    }
  });

  return {
    permissionState,
    fcmToken,
    error,
    enableNotifications,
    unregisterPushToken,
  };
}