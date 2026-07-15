<template>
  <div style="max-width:800px;margin:24px auto;">
    <h2>Meus PDIs</h2>
    <div style="margin-bottom:12px;">
      <router-link to="/pdi/register">Registrar novos itens</router-link>
      <button type="button" @click="logout" style="margin-left:12px;">Sair</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <p v-else-if="error" style="color:red">{{ error }}</p>
    <div v-else>
      <div v-if="pdiItems.length===0">Nenhum PDI encontrado.</div>
      <ul>
        <li v-for="item in pdiItems" :key="item.id" style="margin-bottom:10px;border:1px solid #ddd;padding:8px;">
          <strong>{{ item.theme }}</strong>
          <div>Objetivo: {{ item.objective }}</div>
          <div>Por que: {{ item.why }}</div>
          <div>Como: {{ item.how }}</div>
          <div>Período: {{ item.period }}</div>
          <div>Responsável: {{ item.who }}</div>
          <div style="margin-top:6px;"><router-link :to="`/pdi/update/${item.theme}`">Editar</router-link></div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api, { setAuthToken } from '../services/api'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const pdiItems = ref([])
    const loading = ref(true)
    const error = ref('')
    const router = useRouter()

    async function load(){
      loading.value = true
      error.value = ''
      try{
        const res = await api.get('/pdi/me')
        pdiItems.value = res.data.pdiItems || []
      }catch(err){
        pdiItems.value = []
        error.value = err.response?.data?.error || 'Não foi possível carregar seus PDIs.'
        if (err.response?.status === 401) logout()
      }finally{
        loading.value = false
      }
    }

    onMounted(load)

    function logout(){
      setAuthToken(null)
      router.push('/login')
    }

    return { pdiItems, loading, error, logout }
  }
}
</script>
