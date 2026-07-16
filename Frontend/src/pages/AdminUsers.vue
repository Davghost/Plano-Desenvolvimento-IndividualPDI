<template>
  <main class="page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">Área administrativa</p>
        <h1>Alunos e PDIs</h1>
        <p class="subtitle">Encontre alunos por ID, nome ou turma e consulte o progresso de cada PDI.</p>
      </div>
      <button class="secondary-button" type="button" @click="logout">Sair</button>
    </header>

    <section class="panel" aria-labelledby="filters-title">
      <h2 id="filters-title">Filtros</h2>
      <form class="filters" @submit.prevent="search(1)">
        <label>
          ID do aluno
          <input v-model.trim="filters.id" inputmode="numeric" pattern="[0-9]*" placeholder="Ex.: 12">
        </label>
        <label>
          Nome
          <input v-model.trim="filters.name" placeholder="Digite parte do nome">
        </label>
        <label>
          Turma
          <select v-model="filters.turma">
            <option value="">Todas as turmas</option>
            <option v-for="turma in turmas" :key="turma" :value="turma">{{ turma }}</option>
          </select>
        </label>
        <div class="filter-actions">
          <button class="primary-button" type="submit" :disabled="loading">{{ loading ? 'Buscando...' : 'Buscar alunos' }}</button>
          <button class="text-button" type="button" :disabled="loading" @click="clearFilters">Limpar filtros</button>
        </div>
      </form>
    </section>

    <section class="panel results" aria-live="polite">
      <div class="results-heading">
        <div>
          <h2>Alunos</h2>
          <p v-if="loading">Atualizando a lista…</p>
          <p v-else-if="searched">{{ resultDescription }}</p>
        </div>
      </div>

      <p v-if="error" class="feedback error">{{ error }}</p>
      <p v-else-if="searched && !users.length" class="feedback">Nenhum aluno encontrado com os filtros informados.</p>

      <div v-else-if="users.length" class="table-wrapper">
        <table>
          <thead><tr><th>ID</th><th>Aluno</th><th>E-mail</th><th>Turma</th><th><span class="sr-only">Ações</span></th></tr></thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>#{{ user.id }}</td>
              <td><strong>{{ user.name }}</strong></td>
              <td>{{ user.email }}</td>
              <td><span class="class-tag">{{ user.turma }}</span></td>
              <td><button class="details-button" type="button" @click="loadPdi(user)">Ver PDI <span aria-hidden="true">→</span></button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="pageCount > 1" class="pagination" aria-label="Paginação dos alunos carregados">
        <button type="button" :disabled="currentPage === 1 || loading" @click="goToPage(currentPage - 1)">Anterior</button>
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          :class="{ active: page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          :disabled="loading"
          @click="goToPage(page)"
        >{{ page }}</button>
        <button type="button" :disabled="currentPage === pageCount || loading" @click="goToPage(currentPage + 1)">Próxima</button>
      </nav>
    </section>

    <section v-if="selectedUser" ref="pdiSection" class="panel pdi-panel" aria-live="polite">
      <div class="pdi-heading">
        <div>
          <p class="eyebrow">PDI selecionado</p>
          <h2>{{ selectedUser.name }}</h2>
          <p>{{ selectedUser.email }} · Turma {{ selectedUser.turma }}</p>
        </div>
        <button class="text-button" type="button" @click="closePdi">Fechar detalhes</button>
      </div>
      <p v-if="pdiLoading">Carregando PDI…</p>
      <p v-else-if="pdiError" class="feedback error">{{ pdiError }}</p>
      <div v-else class="pdi-grid">
        <article v-for="item in pdiItems" :key="item.theme" class="pdi-card" :class="{ pending: !item.id }">
          <div class="card-heading"><h3>{{ themeLabels[item.theme] || item.theme }}</h3><span>{{ item.id ? 'Preenchido' : 'Pendente' }}</span></div>
          <template v-if="item.id">
            <p><strong>Objetivo:</strong> {{ item.objective }}</p>
            <p><strong>Por que:</strong> {{ item.why }}</p>
            <p><strong>Como:</strong> {{ item.how }}</p>
            <p><strong>Período:</strong> {{ item.period }}</p>
            <p><strong>Responsável:</strong> {{ item.who }}</p>
          </template>
          <p v-else>Este tema ainda não foi preenchido pelo aluno.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { clearSession } from '../services/api'

const PAGE_SIZE = 8
const TURMAS = ['2026', 'jotateteus', 'sirius']

export default {
  setup() {
    const router = useRouter()
    const filters = reactive({ id: '', name: '', turma: '' })
    const users = ref([])
    const total = ref(0)
    const loading = ref(false)
    const searched = ref(false)
    const error = ref('')
    const currentPage = ref(1)
    const selectedUser = ref(null)
    const pdiItems = ref([])
    const pdiLoading = ref(false)
    const pdiError = ref('')
    const pdiSection = ref(null)
    let activeRequest = null
    const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
    const resultDescription = computed(() => {
      if (!users.value.length) return ''
      return `${total.value} aluno${total.value === 1 ? '' : 's'} encontrado${total.value === 1 ? '' : 's'} · página ${currentPage.value} de ${pageCount.value}.`
    })
    const themeLabels = {
      PROGRAMACAO: 'Programação', MATEMATICA: 'Matemática', INGLES: 'Inglês',
      SOFT_SKILLS: 'Soft skills', OPORTUNIDADES_ACADEMICAS: 'Oportunidades acadêmicas'
    }

    async function search(page = 1) {
      activeRequest?.abort()
      activeRequest = new AbortController()
      error.value = ''
      selectedUser.value = null
      currentPage.value = page
      loading.value = true
      searched.value = true
      try {
        const params = {
          ...Object.fromEntries(Object.entries(filters).filter(([, value]) => String(value).trim() !== '')),
          pages: currentPage.value
        }
        const { data } = await api.get('/admin/filter', { params, signal: activeRequest.signal })
        users.value = data.users || []
        total.value = data.total || 0
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        users.value = []
        total.value = 0
        error.value = err.response?.data?.error || 'Não foi possível buscar os alunos.'
      } finally {
        if (!activeRequest.signal.aborted) loading.value = false
      }
    }

    function clearFilters() {
      filters.id = ''
      filters.name = ''
      filters.turma = ''
      search(1)
    }

    function goToPage(page) {
      const targetPage = Math.min(Math.max(page, 1), pageCount.value)
      if (targetPage !== currentPage.value) search(targetPage)
    }

    async function loadPdi(user) {
      selectedUser.value = user
      pdiItems.value = []
      pdiError.value = ''
      pdiLoading.value = true
      try {
        const { data } = await api.get(`/admin/users/${user.id}`)
        const [returnedUser, items] = data
        selectedUser.value = returnedUser || user
        pdiItems.value = items || []
        await nextTick()
        pdiSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } catch (err) {
        pdiError.value = err.response?.data?.error || 'Não foi possível carregar o PDI do aluno.'
      } finally {
        pdiLoading.value = false
      }
    }

    function closePdi() { selectedUser.value = null }
    function logout() { clearSession(); router.push('/login') }

    onMounted(() => search(1))
    onBeforeUnmount(() => activeRequest?.abort())
    return { filters, turmas: TURMAS, users, loading, searched, error, currentPage, pageCount, resultDescription, selectedUser, pdiItems, pdiLoading, pdiError, themeLabels, pdiSection, search, clearFilters, goToPage, loadPdi, closePdi, logout }
  }
}
</script>
