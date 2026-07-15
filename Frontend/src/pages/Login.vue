<template>
  <div style="max-width:400px;margin:40px auto;">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Senha</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script>
import api, { setAuthToken } from '../services/api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup(){
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    async function handleLogin(){
      error.value = ''
      try{
        const res = await api.post('/auth/login', { email: email.value, password: password.value })
        const token = res.data.token
        setAuthToken(token)
        router.push('/pdi')
      }catch(err){
        error.value = err.response?.data?.error || err.message
      }
    }

    return { email, password, handleLogin, error }
  }
}
</script>
