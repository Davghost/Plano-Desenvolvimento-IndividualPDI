<template>
  <div class="pdi-update-container">
    <h2>Atualizar PDI - {{ theme }}</h2>
    <div v-if="loading" class="pdi-update-loading">Carregando...</div>
    <p v-else-if="error && !found" class="pdi-update-error">{{ error }}</p>
    <form v-else @submit.prevent="handleUpdate" class="pdi-update-form">
      <h3>Dados do PDI</h3>
      
      <div class="pdi-update-group">
        <label for="objective">Objetivo</label>
        <input id="objective" v-model="item.objective" required />
      </div>
      <div class="pdi-update-group">
        <label for="why">Por que</label>
        <input id="why" v-model="item.why" required />
      </div>
      <div class="pdi-update-group">
        <label for="how">Como</label>
        <input id="how" v-model="item.how" required />
      </div>
      <div class="pdi-update-group">
        <label for="period">Período</label>
        <select id="period" v-model="item.period" required>
          <option value="SEMANAL">SEMANAL</option>
          <option value="QUINZENAL">QUINZENAL</option>
          <option value="MENSAL">MENSAL</option>
          <option value="BIMESTRAL">BIMESTRAL</option>
        </select>
      </div>
      <div class="pdi-update-group">
        <label for="who">Responsável</label>
        <input id="who" v-model="item.who" required />
      </div>
      
      <div class="pdi-update-actions">
        <button type="submit" :disabled="saving" class="pdi-btn-update">{{ saving ? 'Atualizando...' : 'Atualizar' }}</button>
      </div>
    </form>

    <div v-if="msg" class="pdi-update-success">{{ msg }}</div>
    <div v-if="error" class="pdi-update-error">{{ error }}</div>
  </div>
</template>

<script>
import api from '../services/api'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  props: ['theme'],
  setup(props){
    const item = ref({ objective: '', why: '', how: '', period: 'SEMANAL', who: '' })
    const loading = ref(true)
    const msg = ref('')
    const error = ref('')
    const found = ref(false)
    const saving = ref(false)
    const router = useRouter()

    async function load(){
      loading.value = true
      error.value = ''
      try{
        const res = await api.get('/pdi/me')
        const arr = res.data.pdiItems || []
        const currentItem = arr.find(pdi => pdi.theme === props.theme)
        if (currentItem) {
          item.value = currentItem
          found.value = true
        } else {
          error.value = 'PDI não encontrado.'
        }
      }catch(err){
        error.value = err.response?.data?.error || 'Não foi possível carregar o PDI.'
      }finally{ loading.value = false }
    }

    async function handleUpdate(){
      msg.value = ''
      error.value = ''
      saving.value = true
      try{
        const payload = { theme: props.theme, objective: item.value.objective, why: item.value.why, how: item.value.how, period: item.value.period, who: item.value.who }
        await api.put('/pdi/update', payload)
        router.push('/pdi')
      }catch(err){
        error.value = err.response?.data?.error || err.message
      }finally {
        saving.value = false
      }
    }

    onMounted(load)
    return { item, loading, handleUpdate, msg, error, found, saving }
  }
}
</script>
