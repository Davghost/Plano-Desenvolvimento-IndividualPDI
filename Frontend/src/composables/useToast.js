import { ref } from "vue";

const toasts = ref([]);

export function useToast() {
  function showToast(title, message, type = "info") {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const toast = { id, title, message, type };
    toasts.value.push(toast);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, showToast, removeToast };
}
