<template>
  <div>
    <!-- Header con acciones -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-shield</v-icon>
          <span>Gestión de Roles</span>
        </div>
        <v-btn
          color="primary"
          @click="abrirDialogoNuevoRol"
          prepend-icon="mdi-shield-plus"
        >
          Nuevo Rol
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="busqueda"
          label="Buscar rol..."
          prepend-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          @input="aplicarFiltros"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Lista de roles -->
    <v-row v-if="cargando">
      <v-col cols="12" md="6" lg="4" v-for="n in 3" :key="n">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="rolesFiltrados.length === 0">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              {{ roles.length === 0 ? 'mdi-shield-plus' : 'mdi-magnify' }}
            </v-icon>
            <h3 class="text-h5 mb-2">
              {{ roles.length === 0 ? 'No hay roles' : 'No se encontraron roles' }}
            </h3>
            <p class="text-body-1 mb-4">
              {{ roles.length === 0 ? 'Crea tu primer rol' : 'Intenta con otros filtros' }}
            </p>
            <v-btn
              v-if="roles.length === 0"
              color="primary"
              @click="abrirDialogoNuevoRol"
              prepend-icon="mdi-shield-plus"
            >
              Crear Primer Rol
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        cols="12"
        md="6"
        lg="4"
        v-for="rol in rolesFiltrados"
        :key="rol.id"
      >
        <v-card
          class="rol-card h-100"
          :class="{ 'rol-destacado': esRolDestacado(rol.nombre) }"
          hover
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar
                :color="obtenerColorRol(rol.nombre)"
                size="40"
                class="mr-3"
              >
                <v-icon color="white">{{ obtenerIconoRol(rol.nombre) }}</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold">{{ rol.nombre }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  ID: {{ rol.id }}
                </div>
              </div>
            </div>
            
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-pencil"
                  title="Editar"
                  @click="editarRol(rol)"
                ></v-list-item>
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Eliminar"
                  @click="confirmarEliminar(rol)"
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>

          <v-card-text>
            <!-- Contador de usuarios -->
            <div class="d-flex align-center mb-3">
              <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
              <span class="text-body-2">
                {{ obtenerConteoUsuarios(rol.id) }} usuario(s) asignado(s)
              </span>
            </div>

            <!-- Descripción del rol -->
            <div class="mb-3">
              <v-chip
                :color="obtenerColorRol(rol.nombre)"
                size="small"
                variant="flat"
              >
                {{ obtenerDescripcionRol(rol.nombre) }}
              </v-chip>
            </div>

            <!-- Vista previa de usuarios -->
            <div v-if="obtenerUsuariosPorRol(rol.id).length > 0">
              <div class="text-caption mb-2 font-weight-medium">Usuarios asignados:</div>
              <div class="avatar-group mb-2">
                <v-avatar
                  v-for="usuario in obtenerUsuariosPorRol(rol.id).slice(0, 3)"
                  :key="usuario.id"
                  size="24"
                  color="primary"
                  class="avatar-overlap"
                >
                  <span class="text-caption">{{ obtenerIniciales(usuario.nombre) }}</span>
                  <v-tooltip activator="parent" location="top">
                    {{ usuario.nombre }}
                  </v-tooltip>
                </v-avatar>
                <v-avatar
                  v-if="obtenerUsuariosPorRol(rol.id).length > 3"
                  size="24"
                  color="grey-lighten-1"
                  class="avatar-overlap"
                >
                  <span class="text-caption">+{{ obtenerUsuariosPorRol(rol.id).length - 3 }}</span>
                  <v-tooltip activator="parent" location="top">
                    {{ obtenerUsuariosPorRol(rol.id).length - 3 }} usuarios más
                  </v-tooltip>
                </v-avatar>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              variant="text"
              @click="verDetallesRol(rol)"
              prepend-icon="mdi-eye"
            >
              Ver Detalles
            </v-btn>
            
            <v-spacer></v-spacer>
            
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="editarRol(rol)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo Nuevo/Editar Rol -->
    <v-dialog v-model="dialogoRol" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editando ? 'Editar Rol' : 'Nuevo Rol' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formulario" v-model="formularioValido">
            <v-text-field
              v-model="formRol.nombre"
              label="Nombre del rol"
              :rules="[reglas.requerido, reglas.sinEspacios]"
              prepend-icon="mdi-shield"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              hint="Sin espacios, usar guiones o camelCase"
              persistent-hint
            ></v-text-field>

            <v-alert
              v-if="formRol.nombre"
              :type="validarNombreRol(formRol.nombre) ? 'success' : 'warning'"
              density="compact"
              class="mb-3"
            >
              {{ validarNombreRol(formRol.nombre) ? 
                'Nombre válido' : 
                'Recomendación: usar nombres como "Administrador", "Manager", "Usuario"' 
              }}
            </v-alert>
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
            @click="guardarRol"
            :loading="guardando"
            :disabled="!formularioValido"
          >
            {{ editando ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Ver Detalles del Rol -->
    <v-dialog v-model="dialogoDetalles" max-width="600px">
      <v-card v-if="rolSeleccionado">
        <v-card-title class="d-flex align-center">
          <v-avatar
            :color="obtenerColorRol(rolSeleccionado.nombre)"
            class="mr-3"
          >
            <v-icon color="white">{{ obtenerIconoRol(rolSeleccionado.nombre) }}</v-icon>
          </v-avatar>
          <span>{{ rolSeleccionado.nombre }}</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <v-icon size="32" color="primary" class="mb-2">mdi-identifier</v-icon>
                  <div class="text-h6">{{ rolSeleccionado.id }}</div>
                  <div class="text-caption">ID del Rol</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text class="text-center">
                  <v-icon size="32" color="success" class="mb-2">mdi-account-group</v-icon>
                  <div class="text-h6">{{ obtenerConteoUsuarios(rolSeleccionado.id) }}</div>
                  <div class="text-caption">Usuarios Asignados</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div v-if="obtenerUsuariosPorRol(rolSeleccionado.id).length > 0">
            <h4 class="mb-3">Usuarios con este rol:</h4>
            <v-list density="compact">
              <v-list-item
                v-for="usuario in obtenerUsuariosPorRol(rolSeleccionado.id)"
                :key="usuario.id"
                :prepend-avatar="null"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary" size="32">
                    <span class="text-caption">{{ obtenerIniciales(usuario.nombre) }}</span>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ usuario.nombre }}</v-list-item-title>
                <v-list-item-subtitle>{{ usuario.correo }}</v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-chip
                    :color="usuario.estado ? 'success' : 'error'"
                    size="x-small"
                    variant="flat"
                  >
                    {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div v-else class="text-center pa-4">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-off</v-icon>
            <p class="text-body-2">No hay usuarios asignados a este rol</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            variant="text"
            @click="dialogoDetalles = false"
          >
            Cerrar
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
          ¿Estás seguro de que deseas eliminar el rol "{{ rolAEliminar?.nombre }}"?
          <br><br>
          <v-alert
            v-if="obtenerConteoUsuarios(rolAEliminar?.id) > 0"
            type="warning"
            density="compact"
          >
            Hay {{ obtenerConteoUsuarios(rolAEliminar?.id) }} usuario(s) asignado(s) a este rol.
            Deberás reasignarlos antes de eliminarlo.
          </v-alert>
          <v-alert v-else type="error" density="compact">
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
            @click="eliminarRol"
            :loading="eliminando"
            :disabled="obtenerConteoUsuarios(rolAEliminar?.id) > 0"
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
import { ref, reactive, computed, onMounted } from 'vue'

// Emits
const emit = defineEmits(['rol-actualizado'])

// Estado reactivo
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const roles = ref([])
const usuarios = ref([])
const dialogoRol = ref(false)
const dialogoDetalles = ref(false)
const dialogoEliminar = ref(false)
const editando = ref(false)
const formularioValido = ref(false)
const rolAEliminar = ref(null)
const rolSeleccionado = ref(null)

// Filtros
const busqueda = ref('')

// Formulario
const formulario = ref(null)
const formRol = reactive({
  id: null,
  nombre: ''
})

// Snackbar para mensajes
const snackbar = reactive({
  mostrar: false,
  mensaje: '',
  color: 'success'
})

// Reglas de validación
const reglas = {
  requerido: value => !!value || 'Este campo es requerido',
  sinEspacios: value => !/\s/.test(value) || 'No debe contener espacios'
}

// Computed
const rolesFiltrados = computed(() => {
  if (!busqueda.value) return roles.value
  
  const termino = busqueda.value.toLowerCase()
  return roles.value.filter(rol => 
    rol.nombre.toLowerCase().includes(termino)
  )
})

// Métodos
const cargarDatos = async () => {
  await Promise.all([
    cargarRoles(),
    cargarUsuarios()
  ])
}

const cargarRoles = async () => {
  cargando.value = true
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
  } finally {
    cargando.value = false
  }
}

const cargarUsuarios = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/usuarios', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      usuarios.value = await response.json()
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const abrirDialogoNuevoRol = () => {
  editando.value = false
  limpiarFormulario()
  dialogoRol.value = true
}

const editarRol = (rol) => {
  editando.value = true
  Object.assign(formRol, {
    id: rol.id,
    nombre: rol.nombre
  })
  dialogoRol.value = true
}

const guardarRol = async () => {
  if (!formularioValido.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const url = editando.value ? `/api/roles/${formRol.id}` : '/api/roles'
    const method = editando.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formRol)
    })
    
    if (response.ok) {
      mostrarMensaje(
        editando.value ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente',
        'success'
      )
      cerrarDialogo()
      await cargarRoles()
      emit('rol-actualizado')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al guardar rol', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

const verDetallesRol = (rol) => {
  rolSeleccionado.value = rol
  dialogoDetalles.value = true
}

const confirmarEliminar = (rol) => {
  rolAEliminar.value = rol
  dialogoEliminar.value = true
}

const eliminarRol = async () => {
  if (!rolAEliminar.value) return
  
  eliminando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/roles/${rolAEliminar.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      mostrarMensaje('Rol eliminado exitosamente', 'success')
      dialogoEliminar.value = false
      await cargarRoles()
      emit('rol-actualizado')
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al eliminar rol', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    eliminando.value = false
  }
}

const cerrarDialogo = () => {
  dialogoRol.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  Object.assign(formRol, {
    id: null,
    nombre: ''
  })
  if (formulario.value) {
    formulario.value.reset()
  }
}

const obtenerConteoUsuarios = (rolId) => {
  return usuarios.value.filter(usuario => usuario.id_rol === rolId).length
}

const obtenerUsuariosPorRol = (rolId) => {
  return usuarios.value.filter(usuario => usuario.id_rol === rolId)
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
    'Admin': 'red',
    'Manager': 'orange',
    'Supervisor': 'orange',
    'Usuario': 'blue',
    'User': 'blue',
    'Invitado': 'grey',
    'Guest': 'grey'
  }
  return colores[rolNombre] || 'primary'
}

const obtenerIconoRol = (rolNombre) => {
  const iconos = {
    'Administrador': 'mdi-shield-crown',
    'Admin': 'mdi-shield-crown',
    'Manager': 'mdi-shield-star',
    'Supervisor': 'mdi-shield-star',
    'Usuario': 'mdi-shield-account',
    'User': 'mdi-shield-account',
    'Invitado': 'mdi-shield-outline',
    'Guest': 'mdi-shield-outline'
  }
  return iconos[rolNombre] || 'mdi-shield'
}

const obtenerDescripcionRol = (rolNombre) => {
  const descripciones = {
    'Administrador': 'Acceso completo',
    'Admin': 'Acceso completo',
    'Manager': 'Gestión avanzada',
    'Supervisor': 'Gestión avanzada',
    'Usuario': 'Acceso estándar',
    'User': 'Acceso estándar',
    'Invitado': 'Solo lectura',
    'Guest': 'Solo lectura'
  }
  return descripciones[rolNombre] || 'Rol personalizado'
}

const esRolDestacado = (rolNombre) => {
  return ['Administrador', 'Admin', 'Manager'].includes(rolNombre)
}

const validarNombreRol = (nombre) => {
  const rolesRecomendados = ['Administrador', 'Manager', 'Usuario', 'Invitado', 'Supervisor']
  return rolesRecomendados.includes(nombre)
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente mediante computed
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
.rol-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.rol-card:hover {
  transform: translateY(-2px);
}

.rol-destacado {
  border-left: 4px solid #f44336;
}

.avatar-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.avatar-overlap {
  margin-left: -8px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-overlap:first-child {
  margin-left: 0;
}

@media (max-width: 600px) {
  .rol-card {
    margin-bottom: 12px;
  }
}
</style>
