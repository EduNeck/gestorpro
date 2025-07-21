<template>
  <div>
    <!-- Header con acciones -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
          <span>Gestión de Usuarios</span>
        </div>
        <v-btn
          color="primary"
          @click="abrirDialogoNuevoUsuario"
          prepend-icon="mdi-account-plus"
        >
          Nuevo Usuario
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="busqueda"
          label="Buscar usuario..."
          prepend-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          @input="aplicarFiltros"
        ></v-text-field>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-select
          v-model="filtroRol"
          :items="opcionesRoles"
          label="Filtrar por Rol"
          prepend-icon="mdi-shield"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="aplicarFiltros"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-select
          v-model="filtroEstado"
          :items="opcionesEstado"
          label="Filtrar por Estado"
          prepend-icon="mdi-filter"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="aplicarFiltros"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Tabla de usuarios -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="usuariosFiltrados"
        :loading="cargando"
        :items-per-page="10"
        class="elevation-1"
        item-value="id"
      >
        <!-- Columna de avatar y nombre -->
        <template v-slot:item.nombre="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar
              color="primary"
              size="40"
              class="mr-3"
            >
              <span class="text-white font-weight-bold">
                {{ obtenerIniciales(item.nombre) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.nombre }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ item.correo }}</div>
            </div>
          </div>
        </template>

        <!-- Columna de rol -->
        <template v-slot:item.rol="{ item }">
          <v-chip
            :color="obtenerColorRol(item.rol_nombre)"
            variant="flat"
            size="small"
          >
            {{ item.rol_nombre || 'Sin rol' }}
          </v-chip>
        </template>

        <!-- Columna de estado -->
        <template v-slot:item.estado="{ item }">
          <v-chip
            :color="item.estado ? 'success' : 'error'"
            variant="flat"
            size="small"
          >
            <v-icon start>{{ item.estado ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
            {{ item.estado ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Columna de fecha -->
        <template v-slot:item.fecha_creacion="{ item }">
          {{ formatearFecha(item.fecha_creacion) }}
        </template>

        <!-- Columna de acciones -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editarUsuario(item)"
          ></v-btn>
          
          <v-btn
            :icon="item.estado ? 'mdi-account-off' : 'mdi-account-check'"
            :color="item.estado ? 'orange' : 'success'"
            size="small"
            variant="text"
            @click="cambiarEstadoUsuario(item)"
          ></v-btn>
          
          <v-btn
            icon="mdi-key-variant"
            color="info"
            size="small"
            variant="text"
            @click="resetearContrasena(item)"
          ></v-btn>
          
          <v-btn
            icon="mdi-delete"
            color="error"
            size="small"
            variant="text"
            @click="confirmarEliminar(item)"
          ></v-btn>
        </template>

        <!-- Estado de carga -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <!-- Sin datos -->
        <template v-slot:no-data>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              {{ usuarios.length === 0 ? 'mdi-account-plus' : 'mdi-magnify' }}
            </v-icon>
            <h3 class="text-h5 mb-2">
              {{ usuarios.length === 0 ? 'No hay usuarios' : 'No se encontraron usuarios' }}
            </h3>
            <p class="text-body-1">
              {{ usuarios.length === 0 ? 'Crea tu primer usuario' : 'Intenta con otros filtros' }}
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo Nuevo/Editar Usuario -->
    <v-dialog v-model="dialogoUsuario" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formulario" v-model="formularioValido">
            <v-text-field
              v-model="formUsuario.nombre"
              label="Nombre completo"
              :rules="[reglas.requerido]"
              prepend-icon="mdi-account"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formUsuario.correo"
              label="Correo electrónico"
              :rules="[reglas.requerido, reglas.email]"
              prepend-icon="mdi-email"
              variant="outlined"
              density="comfortable"
              type="email"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-if="!editando"
              v-model="formUsuario.contrasena"
              label="Contraseña"
              :rules="[reglas.requerido, reglas.contrasena]"
              prepend-icon="mdi-lock"
              variant="outlined"
              density="comfortable"
              type="password"
              class="mb-3"
            ></v-text-field>

            <v-select
              v-model="formUsuario.id_rol"
              :items="rolesParaSelect"
              label="Rol"
              :rules="[reglas.requerido]"
              prepend-icon="mdi-shield"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-select>

            <v-switch
              v-model="formUsuario.estado"
              label="Usuario activo"
              color="success"
              inset
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          
          <v-btn
            color="grey"
            variant="text"
            @click="cerrarDialogo"
          >
            Cancelar
          </v-btn>
          
          <v-btn
            color="primary"
            variant="flat"
            @click="guardarUsuario"
            :loading="guardando"
            :disabled="!formularioValido"
          >
            {{ editando ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Confirmar Eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Confirmar Eliminación</span>
        </v-card-title>

        <v-card-text>
          ¿Estás seguro de que deseas eliminar al usuario "{{ usuarioAEliminar?.nombre }}"?
          <br><br>
          <v-alert type="error" density="compact">
            Esta acción no se puede deshacer.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          
          <v-btn
            color="grey"
            variant="text"
            @click="dialogoEliminar = false"
          >
            Cancelar
          </v-btn>
          
          <v-btn
            color="error"
            variant="flat"
            @click="eliminarUsuario"
            :loading="eliminando"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['usuario-actualizado'])

// Estado reactivo
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const usuarios = ref([])
const dialogoUsuario = ref(false)
const dialogoEliminar = ref(false)
const editando = ref(false)
const formularioValido = ref(false)
const usuarioAEliminar = ref(null)

// Filtros
const busqueda = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')

// Formulario
const formulario = ref(null)
const formUsuario = reactive({
  id: null,
  nombre: '',
  correo: '',
  contrasena: '',
  id_rol: null,
  estado: true
})

// Headers de la tabla
const headers = [
  { title: 'Usuario', key: 'nombre', sortable: true },
  { title: 'Rol', key: 'rol', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Fecha Creación', key: 'fecha_creacion', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: 200 }
]

// Opciones para filtros
const opcionesEstado = [
  { title: 'Todos', value: '' },
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false }
]

// Snackbar para mensajes
const snackbar = reactive({
  mostrar: false,
  mensaje: '',
  color: 'success'
})

// Reglas de validación
const reglas = {
  requerido: value => !!value || 'Este campo es requerido',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
  contrasena: value => (value && value.length >= 6) || 'Mínimo 6 caracteres'
}

// Computed
const usuariosFiltrados = computed(() => {
  let resultado = usuarios.value

  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(usuario => 
      usuario.nombre.toLowerCase().includes(termino) ||
      usuario.correo.toLowerCase().includes(termino)
    )
  }

  if (filtroRol.value) {
    resultado = resultado.filter(usuario => usuario.id_rol === filtroRol.value)
  }

  if (filtroEstado.value !== '') {
    resultado = resultado.filter(usuario => usuario.estado === filtroEstado.value)
  }

  return resultado
})

const rolesParaSelect = computed(() => {
  return props.roles.map(rol => ({
    title: rol.nombre,
    value: rol.id
  }))
})

const opcionesRoles = computed(() => {
  return [
    { title: 'Todos los roles', value: '' },
    ...rolesParaSelect.value
  ]
})

// Métodos
const cargarUsuarios = async () => {
  cargando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/usuarios', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      usuarios.value = await response.json()
    } else {
      mostrarMensaje('Error al cargar usuarios', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    cargando.value = false
  }
}

const abrirDialogoNuevoUsuario = () => {
  editando.value = false
  limpiarFormulario()
  dialogoUsuario.value = true
}

const editarUsuario = (usuario) => {
  editando.value = true
  Object.assign(formUsuario, {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    contrasena: '',
    id_rol: usuario.id_rol,
    estado: usuario.estado
  })
  dialogoUsuario.value = true
}

const guardarUsuario = async () => {
  if (!formularioValido.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const url = editando.value ? `/api/usuarios/${formUsuario.id}` : '/api/usuarios'
    const method = editando.value ? 'PUT' : 'POST'
    
    const payload = { ...formUsuario }
    if (editando.value && !payload.contrasena) {
      delete payload.contrasena
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      mostrarMensaje(
        editando.value ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
        'success'
      )
      cerrarDialogo()
      await cargarUsuarios()
      emit('usuario-actualizado')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al guardar usuario', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

const cambiarEstadoUsuario = async (usuario) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...usuario,
        estado: !usuario.estado
      })
    })
    
    if (response.ok) {
      mostrarMensaje('Estado actualizado exitosamente', 'success')
      await cargarUsuarios()
      emit('usuario-actualizado')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al actualizar estado', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  }
}

const resetearContrasena = async (usuario) => {
  const nuevaContrasena = prompt(`Ingresa la nueva contraseña para ${usuario.nombre}:`)
  if (!nuevaContrasena || nuevaContrasena.length < 6) {
    mostrarMensaje('Contraseña inválida (mínimo 6 caracteres)', 'error')
    return
  }

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/usuarios/${usuario.id}/resetear-contrasena`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contrasena: nuevaContrasena })
    })
    
    if (response.ok) {
      mostrarMensaje('Contraseña actualizada exitosamente', 'success')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al resetear contraseña', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  }
}

const confirmarEliminar = (usuario) => {
  usuarioAEliminar.value = usuario
  dialogoEliminar.value = true
}

const eliminarUsuario = async () => {
  if (!usuarioAEliminar.value) return
  
  eliminando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/usuarios/${usuarioAEliminar.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      mostrarMensaje('Usuario eliminado exitosamente', 'success')
      dialogoEliminar.value = false
      await cargarUsuarios()
      emit('usuario-actualizado')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al eliminar usuario', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    eliminando.value = false
  }
}

const cerrarDialogo = () => {
  dialogoUsuario.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  Object.assign(formUsuario, {
    id: null,
    nombre: '',
    correo: '',
    contrasena: '',
    id_rol: null,
    estado: true
  })
  if (formulario.value) {
    formulario.value.reset()
  }
}

const obtenerIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const obtenerColorRol = (rolNombre) => {
  const colores = {
    'Administrador': 'red',
    'Manager': 'orange',
    'Usuario': 'blue',
    'Invitado': 'grey'
  }
  return colores[rolNombre] || 'primary'
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No definida'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente mediante computed
}

const mostrarMensaje = (mensaje, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.mostrar = true
}

// Watchers
watch(() => props.roles, () => {
  // Recargar usuarios cuando cambien los roles
}, { deep: true })

// Cargar usuarios al montar el componente
onMounted(() => {
  cargarUsuarios()
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-avatar {
  font-size: 14px;
}

@media (max-width: 600px) {
  .v-data-table {
    font-size: 12px;
  }
}
</style>
