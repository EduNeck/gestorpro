<template>
  <v-container>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="large">mdi-shield-account</v-icon>
              <div>
                <h2>Administración de Usuarios y Roles</h2>
                <p class="text-body-2 mt-1">Gestión completa del sistema de usuarios</p>
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estadísticas rápidas -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="flat">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">{{ estadisticas.totalUsuarios }}</div>
            <div class="text-body-2">Total Usuarios</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="flat">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-account-check</v-icon>
            <div class="text-h4 font-weight-bold">{{ estadisticas.usuariosActivos }}</div>
            <div class="text-body-2">Usuarios Activos</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="flat">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-account-off</v-icon>
            <div class="text-h4 font-weight-bold">{{ estadisticas.usuariosInactivos }}</div>
            <div class="text-body-2">Usuarios Inactivos</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" variant="flat">
          <v-card-text class="text-center text-white">
            <v-icon size="40" class="mb-2">mdi-shield</v-icon>
            <div class="text-h4 font-weight-bold">{{ estadisticas.totalRoles }}</div>
            <div class="text-body-2">Roles Disponibles</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs principales -->
    <v-card>
      <v-tabs
        v-model="tabActiva"
        bg-color="primary"
        color="white"
        align-tabs="center"
      >
        <v-tab value="usuarios">
          <v-icon class="mr-2">mdi-account-group</v-icon>
          Gestión de Usuarios
        </v-tab>
        
        <v-tab value="roles">
          <v-icon class="mr-2">mdi-shield</v-icon>
          Gestión de Roles
        </v-tab>
      </v-tabs>

      <v-window v-model="tabActiva">
        <!-- Tab Usuarios -->
        <v-window-item value="usuarios">
          <div class="pa-4">
            <GestionUsuarios 
              :roles="roles" 
              @usuario-actualizado="cargarEstadisticas"
            />
          </div>
        </v-window-item>

        <!-- Tab Roles -->
        <v-window-item value="roles">
          <div class="pa-4">
            <GestionRoles @rol-actualizado="cargarDatos" />
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.mostrar"
      :color="snackbar.color"
      :timeout="3000"
      top
    >
      {{ snackbar.mensaje }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.mostrar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import GestionUsuarios from '../components/GestionUsuarios.vue'
import GestionRoles from '../components/GestionRoles.vue'

// Estado reactivo
const tabActiva = ref('usuarios')
const roles = ref([])

const estadisticas = reactive({
  totalUsuarios: 0,
  usuariosActivos: 0,
  usuariosInactivos: 0,
  totalRoles: 0
})

// Snackbar para mensajes
const snackbar = reactive({
  mostrar: false,
  mensaje: '',
  color: 'success'
})

// Métodos
const cargarDatos = async () => {
  await Promise.all([
    cargarRoles(),
    cargarEstadisticas()
  ])
}

const cargarRoles = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      roles.value = await response.json()
    } else {
      mostrarMensaje('Error al cargar roles', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  }
}

const cargarEstadisticas = async () => {
  try {
    const token = localStorage.getItem('token')
    
    // Cargar usuarios
    const usuariosResponse = await fetch('/api/usuarios', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (usuariosResponse.ok) {
      const usuarios = await usuariosResponse.json()
      estadisticas.totalUsuarios = usuarios.length
      estadisticas.usuariosActivos = usuarios.filter(u => u.estado).length
      estadisticas.usuariosInactivos = usuarios.filter(u => !u.estado).length
    }

    // Cargar roles
    const rolesResponse = await fetch('/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json()
      estadisticas.totalRoles = rolesData.length
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error al cargar estadísticas', 'error')
  }
}

const mostrarMensaje = (mensaje, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.mostrar = true
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.v-card .v-card-text {
  padding: 16px;
}

.v-tabs {
  margin-bottom: 0;
}

.v-window {
  min-height: 600px;
}

@media (max-width: 600px) {
  .v-window {
    min-height: 400px;
  }
}
</style>
