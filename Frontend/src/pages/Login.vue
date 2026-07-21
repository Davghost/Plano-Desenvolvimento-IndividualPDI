<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>PDI</h1>
        <p>Plano de Desenvolvimento Individual</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            required 
          />
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api, { setAuthToken, setCurrentUser } from '../services/api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const router = useRouter()

    async function handleLogin(){
    error.value = ''
    loading.value = true
    try {
      const res = await api.post('/auth/login', { email: email.value, password: password.value })
      
      // O axios coloca a resposta dentro de 'res.data'
      // O seu JSON retorna 'success' e 'data' no primeiro nível
      const { success, data } = res.data
      
      // (Opcional) Você pode validar se o success veio true
      if (!success) throw new Error('Falha na autenticação.')

      // Agora extraímos o token e o safeUser de dentro do objeto 'data'
      const { token, safeUser } = data

      if (!token || !safeUser) throw new Error('Resposta de autenticação inválida.')
      
      setAuthToken(token)
      setCurrentUser(safeUser)
      
      // Usamos safeUser direto agora, em vez de data.safeUser
      router.push(safeUser.role === 'admin' ? '/admin' : '/pdi')
      
    } catch(err) {
      // Mantivemos a sua captura de erro (ajuste err.response?.data?.message se necessário)
      error.value = err.response?.data?.error || err.message
    } finally {
      loading.value = false
    }
  }

  return { email, password, handleLogin, error, loading }
  }
}</script>