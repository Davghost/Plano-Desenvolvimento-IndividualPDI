<template>
  <div style="max-width:800px;margin:24px auto;">
    <h2>Atualizar PDI - {{ theme }}</h2>
    <div v-if="loading">Carregando...</div>
    <p v-else-if="error && !found" style="color:red">{{ error }}</p>
    <form v-else @submit.prevent="handleUpdate">
      <div>
        <label>Objetivo</label>
        <input v-model="item.objective" required />
      </div>
      <div>
        <label>Why</label>
        <input v-model="item.why" required />
      </div>
      <div>
        <label>How</label>
        <input v-model="item.how" required />
      </div>
      <div>
        <label>Período</label>
        <select v-model="item.period" required>
          <option value="SEMANAL">SEMANAL</option>
          <option value="QUINZENAL">QUINZENAL</option>
          <option value="MENSAL">MENSAL</option>
          <option value="BIMESTRAL">BIMESTRAL</option>
        </select>
      </div>
      <div>
        <label>Who</label>
        <input v-model="item.who" required />
      </div>
      <div style="margin-top:8px;"><button type="submit" :disabled="saving">{{ saving ? 'Atualizando...' : 'Atualizar' }}</button></div>
    </form>

    <div v-if="msg" style="color:green;margin-top:8px">{{ msg }}</div>
    <div v-if="error" style="color:red;margin-top:8px">{{ error }}</div>
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
