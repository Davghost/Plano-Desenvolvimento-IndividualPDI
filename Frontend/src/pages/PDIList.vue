<template>
  <div class="pdi-list-container">
    <h2>Meus PDIs</h2>
    <div class="pdi-list-actions">
      <router-link to="/pdi/register">Preencher temas do PDI</router-link>
      <button type="button" @click="logout">Sair</button>
    </div>

    <div v-if="loading" class="pdi-loading">Carregando...</div>
    <p v-else-if="error" class="pdi-error">{{ error }}</p>
    <div v-else>
      <div v-if="registeredItems.length===0" class="pdi-empty">Nenhum item PDI preenchido.</div>
      <ul class="pdi-list" v-else>
        <li v-for="item in pdiItems" :key="item.theme">
          <strong>{{ item.theme }}</strong>
          <template v-if="item.id">
            <div class="pdi-list-item-filled">
              <div><strong>Objetivo:</strong> {{ item.objective }}</div>
              <div><strong>Por que:</strong> {{ item.why }}</div>
              <div><strong>Como:</strong> {{ item.how }}</div>
              <div><strong>Período:</strong> {{ item.period }}</div>
              <div><strong>Responsável:</strong> {{ item.who }}</div>
            </div>
            <div class="pdi-item-actions">
              <router-link :to="`/pdi/update/${item.theme}`">Editar</router-link>
            </div>
          </template>
          <template v-else>
            <div class="pdi-item-pending">Tema ainda não preenchido.</div>
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
        const res = await api.get('/user/pdi/me')
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
