<template>
  <div style="max-width:900px;margin:24px auto;">
    <h2>Registrar PDIs</h2>
    <form @submit.prevent="handleSubmit">
      <div v-for="(row, idx) in rows" :key="idx" style="border:1px solid #ddd;padding:12px;margin-bottom:8px;">
        <div>
          <label>Tema</label>
          <select v-model="row.theme" required>
            <option value="PROGRAMACAO">PROGRAMACAO</option>
            <option value="MATEMATICA">MATEMATICA</option>
            <option value="INGLES">INGLES</option>
            <option value="SOFT_SKILLS">SOFT_SKILLS</option>
            <option value="OPORTUNIDADES_ACADEMICAS">OPORTUNIDADES_ACADEMICAS</option>
          </select>
        </div>
        <div>
          <label>Objetivo</label>
          <input v-model="row.objective" required />
        </div>
        <div>
          <label>Why</label>
          <input v-model="row.why" required />
        </div>
        <div>
          <label>How</label>
          <input v-model="row.how" required />
        </div>
        <div>
          <label>Período</label>
          <select v-model="row.period" required>
            <option value="SEMANAL">SEMANAL</option>
            <option value="QUINZENAL">QUINZENAL</option>
            <option value="MENSAL">MENSAL</option>
            <option value="BIMESTRAL">BIMESTRAL</option>
          </select>
        </div>
        <div>
          <label>Who</label>
          <input v-model="row.who" required />
        </div>
        <div style="margin-top:6px;"><button type="button" @click="removeRow(idx)">Remover</button></div>
      </div>

      <div>
        <button type="button" @click="addRow">Adicionar outro tema</button>
      </div>

      <div style="margin-top:12px;"><button type="submit">Salvar PDIs</button></div>
    </form>

    <div v-if="msg" style="margin-top:12px;color:green">{{ msg }}</div>
    <div v-if="error" style="margin-top:12px;color:red">{{ error }}</div>
  </div>
</template>

<script>
import api from '../services/api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const rows = ref([
      { theme: 'PROGRAMACAO', objective: '', why: '', how: '', period: 'SEMANAL', who: '' }
    ])
    const msg = ref('')
    const error = ref('')
    const router = useRouter()

    function addRow(){
      rows.value.push({ theme: 'PROGRAMACAO', objective: '', why: '', how: '', period: 'SEMANAL', who: '' })
    }
    function removeRow(i){
      rows.value.splice(i,1)
    }

    async function handleSubmit(){
      msg.value = ''
      error.value = ''
      try{
        const payload = { pdiItems: rows.value }
        const res = await api.post('/pdi/register', payload)
        msg.value = res.data.message || 'PDIs salvos com sucesso'
        router.push('/pdi')
      }catch(err){
        error.value = err.response?.data?.error || err.message
      }
    }

    return { rows, addRow, removeRow, handleSubmit, msg, error }
  }
}
</script>
