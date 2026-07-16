// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// O service worker não tem acesso a import.meta.env, então o config
// precisa ser colocado diretamente aqui (são valores públicos, sem problema).
firebase.initializeApp({
  apiKey: "AIzaSyBuSA6NaYBnzG3W-cmlTz4qFOiCsXz--xA",
  authDomain: "pdi-webpush.firebaseapp.com",
  projectId: "pdi-webpush",
  storageBucket: "pdi-webpush.firebasestorage.app",
  messagingSenderId: "79309503539",
  appId: "1:79309503539:web:d8fb6decdd06c39b493746",
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
  event.waitUntil(clients.openWindow(url));
});