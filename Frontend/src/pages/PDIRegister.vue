<template>
  <div class="pdi-register-container">
    <h2>Registrar PDIs</h2>
    <form @submit.prevent="handleSubmit" class="pdi-register-form">
      <div v-for="(row, idx) in rows" :key="idx" class="pdi-register-section">
        <div class="pdi-section-header">
          <div class="pdi-section-title">
            <label>Tema</label>
            <select v-model="row.theme" required>
              <option value="PROGRAMACAO">PROGRAMACAO</option>
              <option value="MATEMATICA">MATEMATICA</option>
              <option value="INGLES">INGLES</option>
              <option value="SOFT_SKILLS">SOFT_SKILLS</option>
              <option value="OPORTUNIDADES_ACADEMICAS">OPORTUNIDADES_ACADEMICAS</option>
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
import api from '../services/api'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const rows = ref([])
    const msg = ref('')
    const error = ref('')
    const saving = ref(false)
    const router = useRouter()

    function addRow(){
      const availableTheme = themes.find(theme => !rows.value.some(row => row.theme === theme))
      if (availableTheme) rows.value.push({ theme: availableTheme, objective: '', why: '', how: '', period: 'SEMANAL', who: '' })
    }
    function removeRow(i){
      rows.value.splice(i,1)
    }

    async function handleSubmit(){
      msg.value = ''
      error.value = ''
      if (new Set(rows.value.map(row => row.theme)).size !== rows.value.length) {
        error.value = 'Cada item deve ter um tema diferente.'
        return
      }
      saving.value = true
      try{
        const payload = { pdiItems: rows.value }
        const res = await api.post('/pdi/register', payload)
        router.push('/pdi')
      }catch(err){
        error.value = err.response?.data?.error || err.message
      }finally {
        saving.value = false
      }
    }

    const themes = ['PROGRAMACAO', 'MATEMATICA', 'INGLES', 'SOFT_SKILLS', 'OPORTUNIDADES_ACADEMICAS']

    onMounted(async () => {
      try {
        const { data } = await api.get('/pdi/me')
        const existing = data.pdiItems || []
        rows.value = existing
          .filter(item => !item.id)
          .map(item => ({ theme: item.theme, objective: '', why: '', how: '', period: 'SEMANAL', who: '' }))
        if (!rows.value.length) msg.value = 'Todos os temas já foram preenchidos. Você pode editá-los na lista.'
      } catch (err) {
        error.value = err.response?.data?.error || 'Não foi possível carregar os temas disponíveis.'
      }
    })

    return { rows, themes, addRow, removeRow, handleSubmit, msg, error, saving }
  }
}
</script>
