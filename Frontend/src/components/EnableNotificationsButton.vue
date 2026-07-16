<!-- src/components/EnableNotificationsButton.vue -->
<script setup>
import { usePushNotifications } from "@/composables/usePushNotifications";

const { permissionState, error, enableNotifications } = usePushNotifications();
</script>

<template>
  <div>
    <button v-if="permissionState !== 'granted'" @click="enableNotifications">
      Ativar notificações
    </button>
    <p v-else>Notificações ativadas ✅</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>