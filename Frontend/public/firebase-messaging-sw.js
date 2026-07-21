// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// O service worker não tem acesso a import.meta.env, então o config
// precisa ser colocado diretamente aqui (são valores públicos, sem problema).
firebase.initializeApp({
  apiKey: "AIzaSyAKkvFtrHkhvEq69a0wHxK-5ncnar1T78k",
  authDomain: "projeto-notifications-2fec1.firebaseapp.com",
  projectId: "projeto-notifications-2fec1",
  storageBucket: "projeto-notifications-2fec1.firebasestorage.app",
  messagingSenderId: "179821609620",
  appId: "1:179821609620:web:06c1d549155cc830fe2a81"
});

const messaging = firebase.messaging();

// Exibe a notificação quando o app está em background/fechado
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png", // ajuste para o ícone do seu app
    data: payload.data,
  });
});

// Ao clicar na notificação, abre/foca a URL desejada
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Procura uma aba já aberta com a mesma origem do app
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient && "navigate" in focusedClient) {
              return focusedClient.navigate(url);
            }
          });
        }
      }
      // Se não encontrou nenhuma aba aberta do app, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});