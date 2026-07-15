<template>
  <div style="max-width:800px;margin:24px auto;">
    <h2>Atualizar PDI - {{ theme }}</h2>
    <div v-if="loading">Carregando...</div>
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
      <div style="margin-top:8px;"><button type="submit">Atualizar</button></div>
    </form>

    <div v-if="msg" style="color:green;margin-top:8px">{{ msg }}</div>
    <div v-if="error" style="color:red;margin-top:8px">{{ error }}</div>
  </div>
</template>

<script>
import api from '../services/api'
import { ref, onMounted } from 'vue'

export default {
  props: ['theme'],
  setup(props){
    const item = ref({ objective: '', why: '', how: '', period: 'SEMANAL', who: '' })
    const loading = ref(true)
    const msg = ref('')
    const error = ref('')

    async function load(){
      loading.value = true
      try{
        const res = await api.get('/pdi/me', { params: { theme: props.theme } })
        const arr = res.data.pdiItems || []
        if(arr.length) item.value = arr[0]
      }catch(err){
        console.error(err)
      }finally{ loading.value = false }
    }

    async function handleUpdate(){
      msg.value = ''
      error.value = ''
      try{
        const payload = { objective: item.value.objective, why: item.value.why, how: item.value.how, period: item.value.period, who: item.value.who }
        const res = await api.put(`/pdi/update/${props.theme}`, payload)
        msg.value = res.data.message || 'Atualizado com sucesso'
      }catch(err){
        error.value = err.response?.data?.error || err.message
      }
    }

    onMounted(load)
    return { item, loading, handleUpdate, msg, error }
  }
}
</script>
