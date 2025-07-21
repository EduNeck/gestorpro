<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <h2>Gestión de Proyectos</h2>
            <v-btn
              color="primary"
              @click="abrirDialogoNuevoProyecto"
              prepend-icon="mdi-plus"
            >
              Nuevo Proyecto
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lista de Proyectos -->
    <v-row>
      <v-col cols="12">
        <v-card v-if="cargando">
          <v-card-text class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-3">Cargando proyectos...</p>
          </v-card-text>
        </v-card>

        <v-card v-else-if="proyectos.length === 0">
          <v-card-text class="text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-plus</v-icon>
            <h3 class="text-h5 mb-2">No tienes proyectos</h3>
            <p class="text-body-1 mb-4">Crea tu primer proyecto para comenzar</p>
            <v-btn
              color="primary"
              @click="abrirDialogoNuevoProyecto"
              prepend-icon="mdi-plus"
            >
              Crear Primer Proyecto
            </v-btn>
          </v-card-text>
        </v-card>

        <div v-else>
          <v-row>
            <v-col
              v-for="proyecto in proyectos"
              :key="proyecto.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="proyecto-card" hover>
                <v-card-title class="d-flex justify-space-between">
                  <span>{{ proyecto.nombre }}</span>
                  <v-chip
                    :color="obtenerColorEstado(proyecto.estado)"
                    size="small"
                    variant="flat"
                  >
                    {{ proyecto.estado }}
                  </v-chip>
                </v-card-title>

                <v-card-text>
                  <p class="text-body-2 mb-3">{{ proyecto.descripcion || 'Sin descripción' }}</p>
                  
                  <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">mdi-calendar-start</v-icon>
                      <span class="text-caption">
                        Inicio: {{ formatearFecha(proyecto.fecha_inicio) }}
                      </span>
                    </div>
                    
                    <div class="d-flex align-center">
                      <v-icon size="small" class="mr-2">mdi-calendar-end</v-icon>
                      <span class="text-caption">
                        Fin: {{ formatearFecha(proyecto.fecha_fin) }}
                      </span>
                    </div>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    @click="verTareas(proyecto)"
                  >
                    Ver Tareas
                  </v-btn>
                  
                  <v-spacer></v-spacer>
                  
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editarProyecto(proyecto)"
                  ></v-btn>
                  
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmarEliminar(proyecto)"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- Diálogo Nuevo/Editar Proyecto -->
    <v-dialog v-model="dialogoProyecto" max-width="600px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editando ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formulario" v-model="formularioValido">
            <v-text-field
              v-model="formProyecto.nombre"
              label="Nombre del Proyecto"
              :rules="[reglas.requerido]"
              prepend-icon="mdi-folder"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="formProyecto.descripcion"
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
                  v-model="formProyecto.fecha_inicio"
                  label="Fecha de Inicio"
                  type="date"
                  :rules="[reglas.requerido]"
                  prepend-icon="mdi-calendar-start"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formProyecto.fecha_fin"
                  label="Fecha de Fin"
                  type="date"
                  :rules="[reglas.requerido, reglas.fechaFin]"
                  prepend-icon="mdi-calendar-end"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-select
              v-model="formProyecto.estado"
              :items="estadosProyecto"
              label="Estado"
              prepend-icon="mdi-flag"
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
            @click="guardarProyecto"
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
          ¿Estás seguro de que deseas eliminar el proyecto "{{ proyectoAEliminar?.nombre }}"?
          <br><br>
          <v-alert type="warning" density="compact">
            Esta acción no se puede deshacer y se eliminarán todas las tareas asociadas.
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
            @click="eliminarProyecto"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Estado reactivo
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const proyectos = ref([])
const dialogoProyecto = ref(false)
const dialogoEliminar = ref(false)
const editando = ref(false)
const formularioValido = ref(false)
const proyectoAEliminar = ref(null)

// Formulario
const formulario = ref(null)
const formProyecto = reactive({
  nombre: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'activo'
})

// Estados de proyecto
const estadosProyecto = [
  { title: 'Activo', value: 'activo' },
  { title: 'Completado', value: 'completado' },
  { title: 'Pausado', value: 'pausado' },
  { title: 'Cancelado', value: 'cancelado' }
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
  fechaFin: value => {
    if (!value || !formProyecto.fecha_inicio) return true
    return new Date(value) >= new Date(formProyecto.fecha_inicio) || 
           'La fecha de fin debe ser posterior a la fecha de inicio'
  }
}

// Métodos
const cargarProyectos = async () => {
  cargando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/proyectos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      proyectos.value = await response.json()
    } else {
      mostrarMensaje('Error al cargar proyectos', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    cargando.value = false
  }
}

const abrirDialogoNuevoProyecto = () => {
  editando.value = false
  limpiarFormulario()
  dialogoProyecto.value = true
}

const editarProyecto = (proyecto) => {
  editando.value = true
  Object.assign(formProyecto, {
    id: proyecto.id,
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    fecha_inicio: proyecto.fecha_inicio,
    fecha_fin: proyecto.fecha_fin,
    estado: proyecto.estado
  })
  dialogoProyecto.value = true
}

const guardarProyecto = async () => {
  if (!formulario.value.validate()) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const url = editando.value ? `/api/proyectos/${formProyecto.id}` : '/api/proyectos'
    const method = editando.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formProyecto)
    })
    
    if (response.ok) {
      mostrarMensaje(
        editando.value ? 'Proyecto actualizado exitosamente' : 'Proyecto creado exitosamente',
        'success'
      )
      cerrarDialogo()
      await cargarProyectos()
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al guardar proyecto', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (proyecto) => {
  proyectoAEliminar.value = proyecto
  dialogoEliminar.value = true
}

const eliminarProyecto = async () => {
  if (!proyectoAEliminar.value) return
  
  eliminando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/proyectos/${proyectoAEliminar.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      mostrarMensaje('Proyecto eliminado exitosamente', 'success')
      dialogoEliminar.value = false
      await cargarProyectos()
    } else {
      const error = await response.json()
      mostrarMensaje(error.mensaje || 'Error al eliminar proyecto', 'error')
    }
  } catch (error) {
    console.error('Error:', error)
    mostrarMensaje('Error de conexión', 'error')
  } finally {
    eliminando.value = false
  }
}

const verTareas = (proyecto) => {
  router.push(`/tareas?proyecto=${proyecto.id}`)
}

const cerrarDialogo = () => {
  dialogoProyecto.value = false
  limpiarFormulario()
}

const limpiarFormulario = () => {
  Object.assign(formProyecto, {
    id: null,
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo'
  })
  if (formulario.value) {
    formulario.value.resetValidation()
  }
}

const obtenerColorEstado = (estado) => {
  const colores = {
    activo: 'primary',
    completado: 'success',
    pausado: 'warning',
    cancelado: 'error'
  }
  return colores[estado] || 'grey'
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No definida'
  return new Date(fecha).toLocaleDateString('es-ES')
}

const mostrarMensaje = (mensaje, color = 'success') => {
  snackbar.mensaje = mensaje
  snackbar.color = color
  snackbar.mostrar = true
}

// Cargar proyectos al montar el componente
onMounted(() => {
  cargarProyectos()
})
</script>

<style scoped>
.proyecto-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.proyecto-card:hover {
  transform: translateY(-2px);
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
