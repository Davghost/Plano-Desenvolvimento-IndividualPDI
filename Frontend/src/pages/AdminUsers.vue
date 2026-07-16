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

    <section v-if="selectedUser" class="panel pdi-panel" aria-live="polite">
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
            <p><strong>Como:</strong> {{ item.how }}</p>
            <footer>{{ item.period }} · {{ item.who }}</footer>
          </template>
          <p v-else>Este tema ainda não foi preenchido pelo aluno.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
    return { filters, turmas: TURMAS, users, loading, searched, error, currentPage, pageCount, resultDescription, selectedUser, pdiItems, pdiLoading, pdiError, themeLabels, search, clearFilters, goToPage, loadPdi, closePdi, logout }
  }
}
</script>

<style scoped>
.page-shell { max-width: 1080px; margin: 40px auto; padding: 0 20px 40px; color: #182230; }
.page-header, .pdi-heading, .results-heading { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
h1, h2, h3, p { margin-top: 0; } h1 { margin-bottom: 8px; } h2 { font-size: 1.2rem; margin-bottom: 8px; } .subtitle, .results-heading p, .pdi-heading p { color: #5c6878; margin-bottom: 0; }
.eyebrow { color: #2866b1; font-weight: 700; font-size: .8rem; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 6px; }
.panel { background: #fff; border: 1px solid #dbe2ea; border-radius: 12px; padding: 22px; margin-top: 20px; box-shadow: 0 2px 10px #1720330d; }
.filters { display: grid; grid-template-columns: 130px minmax(180px, 1fr) minmax(160px, .7fr) auto; gap: 14px; align-items: end; }
label { display: grid; gap: 6px; font-size: .9rem; font-weight: 600; } input, select { box-sizing: border-box; width: 100%; border: 1px solid #b9c5d2; border-radius: 6px; padding: 9px 10px; font: inherit; background: #fff; }
input:focus, select:focus, button:focus-visible { outline: 3px solid #9cc6ff; outline-offset: 2px; } button { cursor: pointer; font: inherit; border-radius: 6px; padding: 9px 12px; border: 1px solid #b9c5d2; background: #fff; } button:disabled { cursor: not-allowed; opacity: .55; }
.filter-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }.primary-button { background: #1769c2; border-color: #1769c2; color: #fff; white-space: nowrap; }.secondary-button { white-space: nowrap; }.text-button { border-color: transparent; color: #1769c2; padding-inline: 4px; }.feedback { margin: 20px 0 0; }.error { color: #b42318; }
.table-wrapper { overflow-x: auto; margin-top: 18px; } table { width: 100%; border-collapse: collapse; min-width: 700px; } th { color: #596779; font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; text-align: left; } th, td { padding: 13px 10px; border-bottom: 1px solid #e5eaf0; } tbody tr:hover { background: #f7faff; }.class-tag { background: #e8f1ff; color: #235791; border-radius: 999px; padding: 4px 9px; font-size: .85rem; }.details-button { border: 0; color: #1769c2; font-weight: 650; padding: 5px; white-space: nowrap; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 5px; margin-top: 20px; }.pagination button.active { color: white; background: #1769c2; border-color: #1769c2; }.pagination button { min-width: 37px; }.pdi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; }.pdi-card { border: 1px solid #cfe0f4; background: #f9fbff; border-radius: 8px; padding: 15px; }.pdi-card.pending { background: #fafafa; border-color: #e1e4e8; color: #667085; }.card-heading { display:flex; justify-content: space-between; gap: 8px; }.card-heading h3 { font-size: 1rem; margin-bottom: 12px; }.card-heading span { font-size: .75rem; font-weight: 700; color: #2866b1; }.pending .card-heading span { color: #667085; }.pdi-card p { font-size: .9rem; line-height: 1.4; margin-bottom: 9px; }.pdi-card footer { color: #526174; font-size: .85rem; }.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media (max-width: 720px) { .page-shell { margin-top: 20px; }.page-header, .pdi-heading { align-items: stretch; flex-direction: column; }.filters { grid-template-columns: 1fr; }.filter-actions { margin-top: 4px; }.primary-button { flex: 1; }.panel { padding: 16px; } }
</style>
