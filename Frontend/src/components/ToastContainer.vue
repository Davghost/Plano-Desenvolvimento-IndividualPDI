<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast-card', `toast-${toast.type}`]"
    >
      <div class="toast-header">
        <h4 class="toast-title">
          {{ toast.title || 'Notificação' }}
        </h4>
        <button
          type="button"
          class="toast-close-btn"
          @click="removeToast(toast.id)"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <p class="toast-message">{{ toast.message }}</p>
      <div class="toast-progress">
        <div class="toast-progress-fill"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();
</script>
