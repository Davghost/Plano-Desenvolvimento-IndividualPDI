<template>
  <div style="max-width:800px;margin:24px auto;">
    <h2>Meus PDIs</h2>
    <div style="margin-bottom:12px;">
      <router-link to="/pdi/register">Preencher temas do PDI</router-link>
      <button type="button" @click="logout" style="margin-left:12px;">Sair</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <p v-else-if="error" style="color:red">{{ error }}</p>
    <div v-else>
      <div v-if="registeredItems.length===0">Nenhum item PDI preenchido.</div>
      <ul>
        <li v-for="item in pdiItems" :key="item.theme" style="margin-bottom:10px;border:1px solid #ddd;padding:8px;">
          <strong>{{ item.theme }}</strong>
          <template v-if="item.id">
            <div>Objetivo: {{ item.objective }}</div>
            <div>Por que: {{ item.why }}</div>
            <div>Como: {{ item.how }}</div>
            <div>Período: {{ item.period }}</div>
            <div>Responsável: {{ item.who }}</div>
            <div style="margin-top:6px;"><router-link :to="`/pdi/update/${item.theme}`">Editar</router-link></div>
          </template>
          <template v-else>
            <div style="margin-top:6px;">Tema ainda não preenchido.</div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api, { clearSession } from '../services/api'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const pdiItems = ref([])
    const loading = ref(true)
    const error = ref('')
    const router = useRouter()
    const registeredItems = computed(() => pdiItems.value.filter(item => item.id))

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
      clearSession()
      router.push('/login')
    }

    return { pdiItems, registeredItems, loading, error, logout }
  }
}
</script>
