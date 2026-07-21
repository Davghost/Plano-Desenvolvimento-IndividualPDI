<template>
  <main class="page-shell">
    <!-- Header -->
    <header class="page-header">
      <div>
        <p class="eyebrow">Área administrativa</p>
        <h1>Painel do Administrador</h1>
        <p class="subtitle">Gerencie alunos, PDIs e envie notificações diretamente pelos sistema.</p>
      </div>
      <div style="display:flex; gap: var(--spacing-sm); align-items:center;">
        <EnableNotificationsButton />
        <button class="secondary-button" type="button" @click="logout">Sair</button>
      </div>
    </header>

    <!-- Tabs -->
    <nav class="admin-tabs" aria-label="Navegação administrativa">
      <button
        id="tab-alunos"
        class="tab-button"
        :class="{ active: activeTab === 'alunos' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'alunos'"
        aria-controls="panel-alunos"
        @click="setTab('alunos')"
      >
        👥 Alunos e PDIs
      </button>
      <button
        id="tab-notificacoes"
        class="tab-button"
        :class="{ active: activeTab === 'notificacoes' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'notificacoes'"
        aria-controls="panel-notificacoes"
        @click="setTab('notificacoes')"
      >
        🔔 Notificações
        <span v-if="notifications.length" class="tab-badge">{{ notifications.length }}</span>
      </button>
    </nav>

    <!-- ===================================
         PAINEL: ALUNOS E PDIs
         =================================== -->
    <div v-show="activeTab === 'alunos'" id="panel-alunos" role="tabpanel" aria-labelledby="tab-alunos">
      <!-- Filtros -->
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

      <!-- Lista de alunos -->
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
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>E-mail</th>
                <th>Turma</th>
                <th>PDI</th>
                <th>Notificar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>#{{ user.id }}</td>
                <td><strong>{{ user.name }}</strong></td>
                <td>{{ user.email }}</td>
                <td><span class="class-tag">{{ user.turma }}</span></td>
                <td><button class="details-button" type="button" @click="loadPdi(user)">Ver PDI <span aria-hidden="true">→</span></button></td>
                <td>
                  <button class="notify-button" type="button" @click="openNotifyUser(user)">
                    🔔 Notificar
                  </button>
                </td>
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

      <!-- PDI do aluno selecionado -->
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
    </div>

    <!-- ===================================
         PAINEL: NOTIFICAÇÕES
         =================================== -->
    <div v-show="activeTab === 'notificacoes'" id="panel-notificacoes" role="tabpanel" aria-labelledby="tab-notificacoes">
      <!-- Filtros de Notificação -->
      <section class="panel" aria-labelledby="notif-filters-title">
        <h2 id="notif-filters-title">Filtrar Notificações</h2>
        <form class="filters-notif" @submit.prevent="fetchNotifications">
          <label>
            ID Notificação
            <input v-model.trim="notifFilters.id" inputmode="numeric" pattern="[0-9]*" placeholder="Ex.: 14">
          </label>
          <label>
            ID Usuário
            <input v-model.trim="notifFilters.user_id" inputmode="numeric" pattern="[0-9]*" placeholder="Ex.: 80">
          </label>
          <label>
            Mensagem
            <input v-model.trim="notifFilters.message" placeholder="Parte da mensagem">
          </label>
          <label>
            Link
            <input v-model.trim="notifFilters.link" placeholder="/pdi">
          </label>
          <div class="filter-actions">
            <button class="primary-button" type="submit" :disabled="notifLoading">{{ notifLoading ? 'Buscando...' : 'Buscar' }}</button>
            <button class="text-button" type="button" :disabled="notifLoading" @click="clearNotifFilters">Limpar</button>
          </div>
        </form>
      </section>

      <!-- Lista de Notificações -->
      <section class="panel results" aria-live="polite">
        <div class="results-heading">
          <div>
            <h2>Notificações</h2>
            <p v-if="notifLoading">Atualizando…</p>
            <p v-else>{{ notifications.length }} registro{{ notifications.length === 1 ? '' : 's' }} encontrado{{ notifications.length === 1 ? '' : 's' }}</p>
          </div>
          <div class="heading-actions">
            <div class="poll-indicator" title="Atualizando automaticamente a cada 10 segundos">
              <span class="poll-dot"></span>
              Auto-refresh
            </div>
            <button class="primary-button" type="button" @click="openNewNotifForm">
              + Nova Notificação
            </button>
          </div>
        </div>

        <p v-if="notifError" class="feedback error">{{ notifError }}</p>
        <p v-else-if="!notifLoading && !notifications.length" class="feedback">Nenhuma notificação encontrada.</p>

        <div v-else-if="notifications.length" class="notif-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Mensagem</th>
                <th>Link</th>
                <th>Criado em</th>
                <th>Expira em</th>
                <th>Status</th>
                <th><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="notif in notifications" :key="notif.id">
                <td>#{{ notif.id }}</td>
                <td><strong>#{{ notif.userId }}</strong></td>
                <td style="max-width: 200px; word-break: break-word;">{{ notif.message }}</td>
                <td><code style="font-size: 0.8em;">{{ notif.link }}</code></td>
                <td>{{ formatDate(notif.created_at) }}</td>
                <td>{{ formatDate(notif.expires_at) }}</td>
                <td>
                  <span :class="isActive(notif.expires_at) ? 'status-active' : 'status-expired'">
                    {{ isActive(notif.expires_at) ? 'Ativa' : 'Expirada' }}
                  </span>
                </td>
                <td>
                  <div class="notif-table-actions">
                    <button
                      class="edit-button"
                      type="button"
                      :disabled="deletingId === notif.id"
                      @click="openEditForm(notif)"
                    >Editar</button>
                    <button
                      class="delete-button"
                      type="button"
                      :disabled="deletingId === notif.id"
                      @click="deleteNotification(notif.id)"
                    >{{ deletingId === notif.id ? '…' : 'Excluir' }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Formulário de Criar / Editar Notificação -->
      <section v-if="showNotifForm" ref="notifFormSection" class="panel notif-form-panel" aria-live="polite">
        <div class="notif-form-heading">
          <div>
            <p class="eyebrow">{{ editingNotif ? 'Editando notificação #' + editingNotif.id : 'Nova notificação' }}</p>
            <h2>{{ editingNotif ? 'Editar Notificação' : 'Criar Notificação' }}</h2>
            <p>{{ editingNotif ? 'Altere a mensagem ou o link da notificação.' : 'Preencha os dados abaixo para enviar uma notificação a um usuário.' }}</p>
          </div>
          <button class="text-button" type="button" @click="closeNotifForm">Fechar formulário</button>
        </div>

        <form class="notif-form" @submit.prevent="submitNotifForm">
          <div class="form-row">
            <div class="form-field">
              <label for="notif-user-id">ID do Usuário <span style="color: var(--color-error)">*</span></label>
              <input
                id="notif-user-id"
                v-model.trim="notifForm.user_id"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="Ex.: 80"
                :disabled="!!editingNotif"
                required
              >
              <p v-if="!editingNotif" class="field-hint">Somente um usuário pode ter uma notificação ativa por vez.</p>
            </div>
            <div class="form-field">
              <label for="notif-link">Link <span style="color: var(--color-error)">*</span></label>
              <input
                id="notif-link"
                v-model.trim="notifForm.link"
                placeholder="/pdi"
                required
              >
              <p class="field-hint">Caminho para onde o usuário será redirecionado.</p>
            </div>
          </div>
          <div class="form-row full">
            <div class="form-field">
              <label for="notif-message">Mensagem</label>
              <textarea
                id="notif-message"
                v-model.trim="notifForm.message"
                rows="3"
                placeholder="Olá, acesse o site para ver atualizações!"
              ></textarea>
              <p class="field-hint">Opcional. Se não informada, uma mensagem padrão será usada.</p>
            </div>
          </div>

          <div class="form-actions">
            <button class="primary-button" type="submit" :disabled="notifSubmitting">
              {{ notifSubmitting ? 'Salvando...' : (editingNotif ? 'Salvar alterações' : 'Criar notificação') }}
            </button>
            <button class="text-button" type="button" @click="closeNotifForm">Cancelar</button>
            <span v-if="notifFormSuccess" class="inline-success">✓ {{ notifFormSuccess }}</span>
            <span v-if="notifFormError" class="inline-error">{{ notifFormError }}</span>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import EnableNotificationsButton from '../components/EnableNotificationsButton.vue'
import { usePushNotifications } from '../composables/usePushNotifications'
import api, { clearSession } from '../services/api'

const PAGE_SIZE = 8
const TURMAS = ['2026', 'jotateteus', 'sirius']
const POLL_INTERVAL_MS = 10_000

export default {
  components: { EnableNotificationsButton },
  setup() {
    const router = useRouter()
    const { unregisterPushToken } = usePushNotifications()

    // ─── Tab ────────────────────────────────────────────────
    const activeTab = ref('alunos')
    let pollTimer = null

    function setTab(tab) {
      activeTab.value = tab
      if (tab === 'notificacoes') {
        fetchNotifications()
        startPolling()
      } else {
        stopPolling()
      }
    }

    function startPolling() {
      stopPolling()
      pollTimer = setInterval(() => {
        if (activeTab.value === 'notificacoes') fetchNotifications(true)
      }, POLL_INTERVAL_MS)
    }

    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    }

    // ─── Users / PDI ─────────────────────────────────────────
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
        const { data } = await api.get('/admin/users/filter', { params, signal: activeRequest.signal })
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
      filters.id = ''; filters.name = ''; filters.turma = ''
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
    const res = await api.get(`/admin/users/pdi/${user.id}`)
    
    // O axios coloca a resposta no 'res.data'. 
    // O seu JSON tem a propriedade 'data' que contém 'pdiItems'.
    const { pdiItems: items } = res.data.data
    
    // Como o novo endpoint não retorna mais o usuário, 
    // o selectedUser.value = user definido na primeira linha já é suficiente.
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
    async function logout() { await unregisterPushToken(); clearSession(); router.push('/login') }

    // ─── Notifications ────────────────────────────────────────
    const notifications = ref([])
    const notifLoading = ref(false)
    const notifError = ref('')
    const notifFilters = reactive({ id: '', user_id: '', message: '', link: '' })

    const showNotifForm = ref(false)
    const editingNotif = ref(null)
    const notifFormSection = ref(null)
    const notifSubmitting = ref(false)
    const notifFormSuccess = ref('')
    const notifFormError = ref('')
    const deletingId = ref(null)
    const notifForm = reactive({ user_id: '', link: '', message: '' })

    async function fetchNotifications(silent = false) {
      if (!silent) notifLoading.value = true
      notifError.value = ''
      try {
        const params = {}
        if (notifFilters.id.trim())      params.id      = notifFilters.id.trim()
        if (notifFilters.user_id.trim()) params.user_id = notifFilters.user_id.trim()
        if (notifFilters.message.trim()) params.message = notifFilters.message.trim()
        if (notifFilters.link.trim())    params.link    = notifFilters.link.trim()

        const { data } = await api.get('/admin/notification/filter', { params })
        notifications.value = Array.isArray(data) ? data : []
      } catch (err) {
        if (!silent) notifError.value = err.response?.data?.error || err.response?.data?.message || 'Erro ao buscar notificações.'
      } finally {
        notifLoading.value = false
      }
    }

    function clearNotifFilters() {
      notifFilters.id = ''; notifFilters.user_id = ''; notifFilters.message = ''; notifFilters.link = ''
      fetchNotifications()
    }

    function isActive(expires_at) {
      return expires_at ? new Date(expires_at) > new Date() : false
    }

    function formatDate(iso) {
      if (!iso) return '—'
      const d = new Date(iso)
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    function openNewNotifForm() {
      editingNotif.value = null
      notifForm.user_id = ''; notifForm.link = ''; notifForm.message = ''
      notifFormSuccess.value = ''; notifFormError.value = ''
      showNotifForm.value = true
      nextTick(() => notifFormSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }

    function openEditForm(notif) {
      editingNotif.value = notif
      notifForm.user_id = String(notif.userId)
      notifForm.link = notif.link
      notifForm.message = notif.message
      notifFormSuccess.value = ''; notifFormError.value = ''
      showNotifForm.value = true
      nextTick(() => notifFormSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }

    function openNotifyUser(user) {
      setTab('notificacoes')
      nextTick(() => {
        editingNotif.value = null
        notifForm.user_id = String(user.id); notifForm.link = ''; notifForm.message = ''
        notifFormSuccess.value = ''; notifFormError.value = ''
        showNotifForm.value = true
        nextTick(() => notifFormSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      })
    }

    function closeNotifForm() {
      showNotifForm.value = false
      editingNotif.value = null
      notifFormSuccess.value = ''; notifFormError.value = ''
    }

    async function submitNotifForm() {
      notifFormSuccess.value = ''; notifFormError.value = ''
      notifSubmitting.value = true
      try {
        if (editingNotif.value) {
          // Update
          const body = {}
          if (notifForm.link.trim())    body.link    = notifForm.link.trim()
          if (notifForm.message.trim()) body.message = notifForm.message.trim()
          await api.put(`/admin/notification/update/${editingNotif.value.id}`, body)
          notifFormSuccess.value = 'Notificação atualizada com sucesso!'
        } else {
          // Create
          const body = {
            user_id: Number(notifForm.user_id),
            link: notifForm.link.trim(),
          }
          if (notifForm.message.trim()) body.message = notifForm.message.trim()
          await api.post('/admin/notification/create', body)
          notifFormSuccess.value = 'Notificação criada com sucesso!'
          notifForm.user_id = ''; notifForm.link = ''; notifForm.message = ''
          editingNotif.value = null
        }
        await fetchNotifications(true)
        setTimeout(() => { notifFormSuccess.value = '' }, 4000)
      } catch (err) {
        notifFormError.value = err.response?.data?.error || err.response?.data?.message || 'Ocorreu um erro ao salvar.'
      } finally {
        notifSubmitting.value = false
      }
    }

    async function deleteNotification(id) {
      if (!confirm(`Excluir a notificação #${id}? Esta ação não pode ser desfeita.`)) return
      deletingId.value = id
      try {
        await api.delete(`/admin/notification/delete/${id}`)
        notifications.value = notifications.value.filter(n => n.id !== id)
        if (editingNotif.value?.id === id) closeNotifForm()
      } catch (err) {
        alert(err.response?.data?.error || 'Não foi possível excluir a notificação.')
      } finally {
        deletingId.value = null
      }
    }

    // ─── Lifecycle ─────────────────────────────────────────
    onMounted(() => search(1))
    onBeforeUnmount(() => { activeRequest?.abort(); stopPolling() })

    return {
      // tab
      activeTab, setTab,
      // users
      filters, turmas: TURMAS, users, loading, searched, error, currentPage, pageCount,
      resultDescription, selectedUser, pdiItems, pdiLoading, pdiError, themeLabels, pdiSection,
      search, clearFilters, goToPage, loadPdi, closePdi, logout,
      // notifications
      notifications, notifLoading, notifError, notifFilters,
      showNotifForm, editingNotif, notifFormSection, notifSubmitting,
      notifFormSuccess, notifFormError, deletingId, notifForm,
      fetchNotifications, clearNotifFilters, isActive, formatDate,
      openNewNotifForm, openEditForm, openNotifyUser, closeNotifForm,
      submitNotifForm, deleteNotification,
    }
  }
}
</script>
