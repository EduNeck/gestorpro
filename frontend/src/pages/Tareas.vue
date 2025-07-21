<template>
  <v-container>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <h2>Gestión de Tareas</h2>
              <p class="text-body-2 mt-1" v-if="proyectoSeleccionado">
                Proyecto: {{ proyectoSeleccionado.nombre }}
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="secondary"
                variant="outlined"
                @click="volverAProyectos"
                prepend-icon="mdi-arrow-left"
              >
                Volver a Proyectos
              </v-btn>
              <v-btn
                color="primary"
                @click="abrirDialogoNuevaTarea"
                prepend-icon="mdi-plus"
              >
                Nueva Tarea
              </v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-4">
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
      
      <v-col cols="12" md="4">
        <v-select
          v-model="filtroPrioridad"
          :items="opcionesPrioridad"
          label="Filtrar por Prioridad"
          prepend-icon="mdi-flag"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="aplicarFiltros"
        ></v-select>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-text-field
          v-model="busqueda"
          label="Buscar tarea..."
          prepend-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          @input="aplicarFiltros"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Lista de Tareas -->
    <v-row>
      <v-col cols="12">
        <v-card v-if="cargando">
          <v-card-text class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-3">Cargando tareas...</p>
          </v-card-text>
        </v-card>

        <v-card v-else-if="tareasFiltradas.length === 0">
          <v-card-text class="text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              {{ tareas.length === 0 ? 'mdi-clipboard-plus' : 'mdi-magnify' }}
            </v-icon>
            <h3 class="text-h5 mb-2">
              {{ tareas.length === 0 ? 'No hay tareas' : 'No se encontraron tareas' }}
            </h3>
            <p class="text-body-1 mb-4">
              {{ tareas.length === 0 ? 'Crea tu primera tarea para este proyecto' : 'Intenta con otros filtros de búsqueda' }}
            </p>
            <v-btn
              v-if="tareas.length === 0"
              color="primary"
              @click="abrirDialogoNuevaTarea"
              prepend-icon="mdi-plus"
            >
              Crear Primera Tarea
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Tablero Kanban Style -->
        <div v-else class="tareas-container">
          <v-row>
            <v-col
              v-for="columna in columnasKanban"
              :key="columna.estado"
              cols="12"
              lg="4"
              class="kanban-column"
            >
              <v-card class="mb-4" variant="outlined">
                <v-card-title class="d-flex align-center">
                  <v-icon :color="columna.color" class="mr-2">{{ columna.icono }}</v-icon>
                  <span>{{ columna.titulo }}</span>
                  <v-spacer></v-spacer>
                  <v-chip size="small" variant="flat" :color="columna.color">
                    {{ obtenerTareasPorEstado(columna.estado).length }}
                  </v-chip>
                </v-card-title>
              </v-card>

              <div class="tareas-columna">
                <v-card
                  v-for="tarea in obtenerTareasPorEstado(columna.estado)"
                  :key="tarea.id"
                  class="tarea-card mb-3"
                  :class="{ 'tarea-vencida': esTareaVencida(tarea) }"
                  hover
                >
                  <v-card-title class="pb-2">
                    <div class="d-flex justify-space-between align-start w-100">
                      <span class="text-subtitle-1">{{ tarea.titulo }}</span>
                      <v-chip
                        :color="obtenerColorPrioridad(tarea.prioridad)"
                        size="x-small"
                        variant="flat"
                      >
                        {{ tarea.prioridad }}
                      </v-chip>
                    </div>
                  </v-card-title>

                  <v-card-text class="pt-0">
                    <p class="text-body-2 mb-3" v-if="tarea.descripcion">
                      {{ tarea.descripcion }}
                    </p>
                    
                    <div class="d-flex align-center mb-2" v-if="tarea.fecha_vencimiento">
                      <v-icon 
                        size="small" 
                        class="mr-2"
                        :color="esTareaVencida(tarea) ? 'error' : 'default'"
                      >
                        mdi-calendar-clock
                      </v-icon>
                      <span 
                        class="text-caption"
                        :class="{ 'text-error': esTareaVencida(tarea) }"
                      >
                        Vence: {{ formatearFecha(tarea.fecha_vencimiento) }}
                      </span>
                    </div>

                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">mdi-clock</v-icon>
                      <span class="text-caption">
                        Creado: {{ formatearFecha(tarea.fecha_creacion) }}
                      </span>
                    </div>
                  </v-card-text>

                  <v-card-actions class="pt-0">
                    <v-btn
                      v-if="tarea.estado === 'pendiente'"
                      color="success"
                      variant="text"
                      size="small"
                      @click="cambiarEstadoTarea(tarea, 'proceso')"
                    >
                      Iniciar
                    </v-btn>
                    
                    <v-btn
                      v-if="tarea.estado === 'proceso'"
                      color="success"
                      variant="text"
                      size="small"
                      @click="cambiarEstadoTarea(tarea, 'finalizada')"
                    >
                      Finalizar
                    </v-btn>
                    
                    <v-spacer></v-spacer>
                    
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editarTarea(tarea)"
                    ></v-btn>
                    
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="confirmarEliminar(tarea)"
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- Diálogo Nueva/Editar Tarea -->
    <v-dialog v-model="dialogoTarea" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editando ? 'Editar Tarea' : 'Nueva Tarea' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formulario" v-model="formularioValido">
            <v-text-field
              v-model="formTarea.titulo"
              label="Título de la Tarea"
              :rules="[reglas.requerido]"
              prepend-icon="mdi-clipboard-text"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="formTarea.descripcion"
              label="Descripción"
              prepend-icon="mdi-text"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-3"
            ></v-textarea>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formTarea.fecha_vencimiento"
                  label="Fecha de Vencimiento"
                  type="date"
                  prepend-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formTarea.prioridad"
                  :items="prioridadesTarea"
                  label="Prioridad"
                  :rules="[reglas.requerido]"
                  prepend-icon="mdi-flag"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>

            <v-select
              v-model="formTarea.estado"
              :items="estadosTarea"
              label="Estado"
              prepend-icon="mdi-flag-checkered"
              variant="outlined"
              density="comfortable"
              v-if="editando"
            ></v-select>
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
            @click="guardarTarea"
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
          ¿Estás seguro de que deseas eliminar la tarea "{{ tareaAEliminar?.titulo }}"?
          <br><br>
          <v-alert type="warning" density="compact">
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
            @click="eliminarTarea"
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
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Router
const router = useRouter()
const route = useRoute()

// Estado reactivo
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const tareas = ref([])
const proyectoSeleccionado = ref(null)
const dialogoTarea = ref(false)
const dialogoEliminar = ref(false)
const editando = ref(false)
const formularioValido = ref(false)
const tareaAEliminar = ref(null)

// Filtros
const filtroEstado = ref('')
const filtroPrioridad = ref('')
const busqueda = ref('')

// Formulario
const formulario = ref(null)
const formTarea = reactive({
  titulo: '',
  descripcion: '',
  fecha_vencimiento: '',
  prioridad: 'media',
  estado: 'pendiente'
})

// Opciones
const estadosTarea = [
  { title: 'Pendiente', value: 'pendiente' },
  { title: 'En Proceso', value: 'proceso' },
  { title: 'Finalizada', value: 'finalizada' }
]

const prioridadesTarea = [
  { title: 'Alta', value: 'alta' },
  { title: 'Media', value: 'media' },
  { title: 'Baja', value: 'baja' }
]

const opcionesEstado = [
  { title: 'Todas', value: '' },
  ...estadosTarea
]

const opcionesPrioridad = [
  { title: 'Todas', value: '' },
  ...prioridadesTarea
]

// Columnas Kanban
const columnasKanban = [
  {
    estado: 'pendiente',
    titulo: 'Pendientes',
    color: 'orange',
    icono: 'mdi-clock-outline'
  },
  {
    estado: 'proceso',
    titulo: 'En Proceso',
    color: 'blue',
    icono: 'mdi-progress-clock'
  },
  {
    estado: 'finalizada',
    titulo: 'Finalizadas',
    color: 'green',
    icono: 'mdi-check-circle'
  }
]

// Snackbar para mensajes
const snackbar = reactive({
  mostrar: false,
  mensaje: '',
  color: 'success'
})

// Reglas de validación
const reglas = {
  requerido: value => !!value || 'Este campo es requerido'
}

// Computed
const tareasFiltradas = computed(() => {
  let resultado = tareas.value

  if (filtroEstado.value) {
    resultado = resultado.filter(tarea => tarea.estado === filtroEstado.value)
  }

  if (filtroPrioridad.value) {
    resultado = resultado.filter(tarea => tarea.prioridad === filtroPrioridad.value)
  }

  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase()
    resultado = resultado.filter(tarea => 
      tarea.titulo.toLowerCase().includes(termino) ||
      (tarea.descripcion && tarea.descripcion.toLowerCase().includes(termino))
    )
  }

  return resultado
})

// Métodos
const cargarTareas = async () => {
  const proyectoId = route.query.proyecto
  if (!proyectoId) {
    volverAProyectos()
    return
  }

  cargando.value = true
  try {
    const token = localStorage.getItem('token')
    
    // Cargar información del proyecto
    const proyectoResponse = await fetch(`/api/proyectos/${proyectoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (proyectoResponse.ok) {
      proyectoSeleccionado.value = await proyectoResponse.json()
    }

    // Cargar tareas del proyecto
    const tareasResponse = await fetch(`/api/tareas/proyecto/${proyectoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (tareasResponse.ok) {
      tareas.value = await tareasResponse.json()
    } else {
      mostrarMensaje('Error al cargar tareas', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    cargando.value = false
  }
}

const obtenerTareasPorEstado = (estado) => {
  return tareasFiltradas.value.filter(tarea => tarea.estado === estado)
}

const abrirDialogoNuevaTarea = () => {
  editando.value = false
  limpiarFormulario()
  dialogoTarea.value = true
}

const editarTarea = (tarea) => {
  editando.value = true
  Object.assign(formTarea, {
    id: tarea.id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    fecha_vencimiento: tarea.fecha_vencimiento,
    prioridad: tarea.prioridad,
    estado: tarea.estado
  })
  dialogoTarea.value = true
}

const guardarTarea = async () => {
  if (!formularioValido.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const url = editando.value ? `/api/tareas/${formTarea.id}` : '/api/tareas'
    const method = editando.value ? 'PUT' : 'POST'
    
    const payload = { ...formTarea }
    if (!editando.value) {
      payload.id_proyecto = route.query.proyecto
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
        editando.value ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente',
        'success'
      )
      cerrarDialogo()
      await cargarTareas()
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al guardar tarea', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

const cambiarEstadoTarea = async (tarea, nuevoEstado) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/tareas/${tarea.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...tarea,
        estado: nuevoEstado
      })
    })
    
    if (response.ok) {
      mostrarMensaje('Estado actualizado exitosamente', 'success')
      await cargarTareas()
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al actualizar estado', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  }
}

const confirmarEliminar = (tarea) => {
  tareaAEliminar.value = tarea
  dialogoEliminar.value = true
}

const eliminarTarea = async () => {
  if (!tareaAEliminar.value) return
  
  eliminando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/tareas/${tareaAEliminar.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      mostrarMensaje('Tarea eliminada exitosamente', 'success')
      dialogoEliminar.value = false
      await cargarTareas()
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al eliminar tarea', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    eliminando.value = false
  }
}

const volverAProyectos = () => {
  router.push('/proyectos')
}

const cerrarDialogo = () => {
  dialogoTarea.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  Object.assign(formTarea, {
    id: null,
    titulo: '',
    descripcion: '',
    fecha_vencimiento: '',
    prioridad: 'media',
    estado: 'pendiente'
  })
  if (formulario.value) {
    formulario.value.reset()
  }
}

const obtenerColorPrioridad = (prioridad) => {
  const colores = {
    alta: 'error',
    media: 'warning',
    baja: 'success'
  }
  return colores[prioridad] || 'grey'
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No definida'
  return new Date(fecha).toLocaleDateString('es-ES')
}

const esTareaVencida = (tarea) => {
  if (!tarea.fecha_vencimiento || tarea.estado === 'finalizada') return false
  return new Date(tarea.fecha_vencimiento) < new Date()
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente mediante computed
}

const mostrarMensaje = (mensaje, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.mostrar = true
}

// Cargar tareas al montar el componente
onMounted(() => {
  cargarTareas()
})

// Recargar tareas si cambia el proyecto en la URL
watch(() => route.query.proyecto, () => {
  cargarTareas()
})
</script>

<style scoped>
.tareas-container {
  width: 100%;
}

.kanban-column {
  min-height: 500px;
}

.tareas-columna {
  min-height: 400px;
}

.tarea-card {
  transition: transform 0.2s ease-in-out;
  border-left: 4px solid transparent;
}

.tarea-card:hover {
  transform: translateY(-2px);
}

.tarea-vencida {
  border-left-color: #f44336 !important;
  background-color: rgba(244, 67, 54, 0.05);
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

@media (max-width: 960px) {
  .kanban-column {
    min-height: auto;
  }
  
  .tareas-columna {
    min-height: auto;
  }
}
</style>
