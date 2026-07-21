<template>
  <div class="pdi-list-container">
    <h2>Meus PDIs</h2>

    <div class="pdi-list-actions">
      <router-link to="/pdi/register">
        Cadastrar PDI
      </router-link>

      <EnableNotificationsButton />

      <button type="button" @click="logout">
        Sair
      </button>
    </div>

    <div v-if="loading" class="pdi-loading">
      Carregando...
    </div>

    <p v-else-if="error" class="pdi-error">
      {{ error }}
    </p>

    <div v-else>
      <div
        v-if="pdiItems.length === 0"
        class="pdi-empty"
      >
        Nenhum PDI cadastrado.
      </div>

      <ul
        v-else
        class="pdi-list"
      >
        <li
          v-for="item in pdiItems"
          :key="item.id"
        >
          <strong>{{ item.theme }}</strong>

          <div class="pdi-list-item-filled">
            <div>
              <strong>Objetivo:</strong>
              {{ item.objective }}
            </div>

            <div>
              <strong>Por que:</strong>
              {{ item.why }}
            </div>

            <div>
              <strong>Como:</strong>
              {{ item.how }}
            </div>

            <div>
              <strong>Período:</strong>
              {{ item.period }}
            </div>

            <div>
              <strong>Responsável:</strong>
              {{ item.who }}
            </div>
          </div>

          <div class="pdi-item-actions">
            <router-link :to="`/pdi/update?id=${item.id}`">
  Editar
</router-link>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import api, { clearSession } from "../services/api";

import EnableNotificationsButton from "@/components/EnableNotificationsButton.vue";
import { usePushNotifications } from "@/composables/usePushNotifications";

export default {
  components: {
    EnableNotificationsButton,
  },

  setup() {
    const router = useRouter();

    const pdiItems = ref([]);
    const loading = ref(true);
    const error = ref("");

    const { unregisterPushToken } = usePushNotifications();

    async function load() {
      loading.value = true;
      error.value = "";

      try {
        const res = await api.get("/user/pdi/me");

        pdiItems.value = res.data.data.pdiItems || [];
      } catch (err) {
        pdiItems.value = [];

        error.value =
          err.response?.data?.error ||
          "Não foi possível carregar seus PDIs.";

        if (err.response?.status === 401) {
          await logout();
        }
      } finally {
        loading.value = false;
      }
    }

    onMounted(load);

    async function logout() {
      try {
        await unregisterPushToken();
      } catch (_) {}

      clearSession();
      router.push("/login");
    }

    return {
      pdiItems,
      loading,
      error,
      logout,
    };
  },
};
</script>