<template>
  <div class="pdi-register-container">
    <h2>Registrar PDIs</h2>
    <form @submit.prevent="handleSubmit" class="pdi-register-form">
      <div v-for="(row, idx) in rows" :key="idx" class="pdi-register-section">
        <div class="pdi-section-header">
          <div class="pdi-section-title">
            <label>Tema</label>
            <select v-model="row.theme" required>
  <option
    v-for="theme in availableThemes(row.theme)"
    :key="theme"
    :value="theme"
  >
    {{ theme }}
  </option>
</select>
          </div>
          <button type="button" :disabled="rows.length === 1" @click="removeRow(idx)" class="pdi-section-remove">Remover</button>
        </div>

        <div class="pdi-form-group">
          <label>Objetivo</label>
          <input v-model="row.objective" required />
        </div>
        <div class="pdi-form-group">
          <label>Why</label>
          <input v-model="row.why" required />
        </div>
        <div class="pdi-form-group">
          <label>How</label>
          <input v-model="row.how" required />
        </div>
        <div class="pdi-form-group">
          <label>Período</label>
          <select v-model="row.period" required>
            <option value="SEMANAL">SEMANAL</option>
            <option value="QUINZENAL">QUINZENAL</option>
            <option value="MENSAL">MENSAL</option>
            <option value="BIMESTRAL">BIMESTRAL</option>
          </select>
        </div>
        <div class="pdi-form-group">
          <label>Who</label>
          <input v-model="row.who" required />
        </div>
      </div>

      <button type="button" :disabled="rows.length === themes.length" @click="addRow" class="pdi-btn-add">Adicionar outro tema</button>

      <div class="pdi-form-actions">
        <button type="submit" :disabled="saving || rows.length === 0" class="pdi-btn-submit">{{ saving ? 'Salvando...' : 'Salvar PDIs' }}</button>
      </div>
    </form>

    <div v-if="msg" class="pdi-message success">{{ msg }}</div>
    <div v-if="error" class="pdi-message error">{{ error }}</div>
  </div>
</template>
<script>
import api from "../services/api";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const rows = ref([]);
    const registeredThemes = ref([]);

    const msg = ref("");
    const error = ref("");
    const saving = ref(false);

    const themes = [
      "PROGRAMACAO",
      "MATEMATICA",
      "INGLES",
      "SOFT_SKILLS",
      "OPORTUNIDADES_ACADEMICAS",
    ];

    function availableThemes(currentTheme = null) {
      return themes.filter((theme) => {

        if (theme === currentTheme) return true;

        if (registeredThemes.value.includes(theme)) {
          return false;
        }

        return !rows.value.some((row) => row.theme === theme);
      });
    }

    function addRow() {
      const theme = availableThemes()[0];

      if (!theme) return;

      rows.value.push({
        theme,
        objective: "",
        why: "",
        how: "",
        period: "SEMANAL",
        who: "",
      });
    }

    function removeRow(index) {
      rows.value.splice(index, 1);

      if (!rows.value.length && availableThemes().length) {
        addRow();
      }
    }

    async function handleSubmit() {
      msg.value = "";
      error.value = "";

      if (!rows.value.length) {
        error.value = "Adicione pelo menos um PDI.";
        return;
      }

      const duplicated =
        new Set(rows.value.map((r) => r.theme)).size !== rows.value.length;

      if (duplicated) {
        error.value = "Cada tema só pode aparecer uma vez.";
        return;
      }

      saving.value = true;

      try {

        await api.post("/user/pdi/register", {
          pdiItems: rows.value,
        });

        router.push("/pdi");

      } catch (err) {

        error.value =
          err.response?.data?.error ||
          "Erro ao registrar os PDIs.";

      } finally {
        saving.value = false;
      }
    }

    onMounted(async () => {

      try {

        const { data } = await api.get("/user/pdi/me");

        const items = data.data.pdiItems || [];

        registeredThemes.value = items
          .filter(item => item.id !== null)
          .map(item => item.theme);

        if (registeredThemes.value.length === themes.length) {

          msg.value =
            "Todos os temas já foram cadastrados. Você pode editá-los na lista.";

          return;
        }

        addRow();

      } catch (err) {

        error.value =
          err.response?.data?.error ||
          "Não foi possível carregar os temas.";

      }

    });

    return {
      rows,
      themes,
      msg,
      error,
      saving,
      addRow,
      removeRow,
      handleSubmit,
      availableThemes,
    };
  },
};
</script>