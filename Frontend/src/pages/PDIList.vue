<template>
  <div style="max-width:800px;margin:24px auto;">
    <h2>Meus PDIs</h2>
    <div style="margin-bottom:12px;">
      <router-link to="/pdi/register">Registrar novos itens</router-link>
    </div>

    <div v-if="loading">Carregando...</div>
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
import api from '../services/api'
import { ref, onMounted } from 'vue'

export default {
  setup(){
    const pdiItems = ref([])
    const loading = ref(true)

    async function load(){
      loading.value = true
      try{
        const res = await api.get('/pdi/me')
        pdiItems.value = res.data.pdiItems || []
      }catch(err){
        console.error(err)
        pdiItems.value = []
      }finally{
        loading.value = false
      }
    }

    onMounted(load)

    return { pdiItems, loading }
  }
}
</script>
