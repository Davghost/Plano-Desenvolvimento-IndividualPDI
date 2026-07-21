<template>
  <div class="pdi-update-container">
    <h2>Atualizar PDI</h2>

    <div v-if="loading" class="pdi-update-loading">
      Carregando...
    </div>

    <p
      v-else-if="error && !found"
      class="pdi-update-error"
    >
      {{ error }}
    </p>

    <form
      v-else
      @submit.prevent="handleUpdate"
      class="pdi-update-form"
    >
      <h3>{{ item.theme }}</h3>

      <div class="pdi-update-group">
        <label>Objetivo</label>
        <input
          v-model="item.objective"
          required
        />
      </div>

      <div class="pdi-update-group">
        <label>Por que</label>
        <input
          v-model="item.why"
          required
        />
      </div>

      <div class="pdi-update-group">
        <label>Como</label>
        <input
          v-model="item.how"
          required
        />
      </div>

      <div class="pdi-update-group">
        <label>Período</label>

        <select
          v-model="item.period"
          required
        >
          <option value="SEMANAL">SEMANAL</option>
          <option value="QUINZENAL">QUINZENAL</option>
          <option value="MENSAL">MENSAL</option>
          <option value="BIMESTRAL">BIMESTRAL</option>
        </select>
      </div>

      <div class="pdi-update-group">
        <label>Responsável</label>

        <input
          v-model="item.who"
          required
        />
      </div>

      <div class="pdi-update-actions">
        <button
          type="submit"
          :disabled="saving"
          class="pdi-btn-update"
        >
          {{ saving ? "Atualizando..." : "Atualizar" }}
        </button>
      </div>
    </form>

    <div
      v-if="msg"
      class="pdi-update-success"
    >
      {{ msg }}
    </div>

    <div
      v-if="error && found"
      class="pdi-update-error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const id = Number(route.query.id);

    const loading = ref(true);
    const saving = ref(false);
    const found = ref(false);

    const msg = ref("");
    const error = ref("");

    const item = ref({
      id: null,
      theme: "",
      objective: "",
      why: "",
      how: "",
      period: "SEMANAL",
      who: "",
    });

    async function load() {
      loading.value = true;
      error.value = "";

      try {
        const { data } = await api.get("/user/pdi/me");

        const list = data.data.pdiItems || [];

        const current = list.find((pdi) => pdi.id === id);

        if (!current) {
          error.value = "PDI não encontrado.";
          return;
        }

        item.value = { ...current };
        found.value = true;
      } catch (err) {
        error.value =
          err.response?.data?.error ||
          "Não foi possível carregar o PDI.";
      } finally {
        loading.value = false;
      }
    }

    async function handleUpdate() {
      msg.value = "";
      error.value = "";
      saving.value = true;

      try {
        await api.put("/user/pdi/update", {
  pdiItems: [
    {
      theme: item.value.theme,
      objective: item.value.objective,
      why: item.value.why,
      how: item.value.how,
      period: item.value.period,
      who: item.value.who,
    },
  ],
});

        router.push("/pdi");
      } catch (err) {
        error.value =
          err.response?.data?.error ||
          "Não foi possível atualizar o PDI.";
      } finally {
        saving.value = false;
      }
    }

    onMounted(load);

    return {
      item,
      loading,
      saving,
      found,
      msg,
      error,
      handleUpdate,
    };
  },
};
</script>