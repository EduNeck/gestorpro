<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" permanent>
      <v-list>
        <v-list-item class="logo-header pa-4">
          <template v-slot:prepend>
            <div class="logo-nav-container">
              <img 
                v-if="navLogoImage && navLogoLoaded"
                :src="navLogoImage" 
                alt="GestorPro Logo" 
                class="logo-nav-image"
                @error="onNavImageError"
                @load="onNavImageLoad"
              />
              <!-- Fallback si no se encuentra la imagen -->
              <v-avatar 
                v-if="!navLogoLoaded"
                color="primary" 
                size="40" 
                class="logo-nav-fallback"
              >
                <v-icon color="white" size="20">mdi-briefcase-variant</v-icon>
              </v-avatar>
            </div>
          </template>
          
          <v-list-item-title class="logo-text">
            <span class="text-primary font-weight-bold">Gestor</span><span class="text-secondary">Pro</span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            Sistema de Gestión
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item
          to="/proyectos"
          prepend-icon="mdi-folder-multiple"
          title="Proyectos"
          color="primary"
        ></v-list-item>

        <v-list-item
          to="/tareas"
          prepend-icon="mdi-clipboard-list"
          title="Tareas"
          color="primary"
        ></v-list-item>

        <v-divider v-if="esAdministrador" class="my-2"></v-divider>

        <v-list-item
          v-if="esAdministrador"
          to="/admin"
          prepend-icon="mdi-shield-account"
          title="Administración"
          subtitle="Usuarios y Roles"
          color="warning"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="$vuetify.display.mobile"></v-app-bar-nav-icon>
      
      <v-app-bar-title class="d-flex align-center">
        <div class="logo-appbar-container mr-3">
          <img 
            v-if="appbarLogoImage && appbarLogoLoaded"
            :src="appbarLogoImage" 
            alt="GestorPro Logo" 
            class="logo-appbar-image"
            @error="onAppbarImageError"
            @load="onAppbarImageLoad"
          />
          <!-- Fallback si no se encuentra la imagen -->
          <v-avatar 
            v-if="!appbarLogoLoaded"
            color="white" 
            size="32" 
            class="logo-appbar-fallback"
          >
            <v-icon color="primary" size="18">mdi-briefcase-variant</v-icon>
          </v-avatar>
        </div>
        
        <div>
          <span class="font-weight-bold">Gestor</span><span class="font-weight-light">Pro</span>          
        </div>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Información del usuario -->
      <v-chip
        variant="text"
        color="white"
        class="mr-3 user-chip"
        prepend-icon="mdi-account-circle"
      >
        {{ nombreUsuario || 'Cargando...' }}
        <v-tooltip activator="parent" location="bottom">
          <div class="text-center">
            <div class="font-weight-bold">{{ nombreUsuario }}</div>
            <div class="text-caption">{{ correoUsuario }}</div>
            <div class="text-caption">Rol: {{ rolUsuario }}</div>
          </div>
        </v-tooltip>
      </v-chip>
      
      <v-btn icon @click="logout" title="Cerrar sesión">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
      
      <!-- Snackbar para mensajes de acceso denegado -->
      <v-snackbar
        v-model="mostrarMensajeAcceso"
        color="error"
        :timeout="5000"
        location="top"
        variant="elevated"
      >
        <v-icon start>mdi-shield-alert</v-icon>
        Acceso denegado. Esta sección requiere permisos de administrador.
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="mostrarMensajeAcceso = false"
          >
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

// Importar logos
let navLogoImage = null
let appbarLogoImage = null

try {
  navLogoImage = new URL('../assets/GestorPro.png', import.meta.url).href
  appbarLogoImage = new URL('../assets/GestorPro.png', import.meta.url).href
} catch (error) {
  console.warn('Logo no encontrado en assets, usando fallback')
}

const router = useRouter()
const route = useRoute()
const drawer = ref(true)
const navLogoLoaded = ref(!!navLogoImage)
const appbarLogoLoaded = ref(!!appbarLogoImage)
const nombreUsuario = ref('')
const correoUsuario = ref('')
const rolUsuario = ref('')
const esAdministrador = ref(false)
const mostrarMensajeAcceso = ref(false)

// Observar cambios en la ruta para detectar errores de acceso
watch(() => route.query.error, (newError) => {
  if (newError === 'access_denied') {
    mostrarMensajeAcceso.value = true
    // Limpiar el parámetro de la URL
    router.replace({ query: {} })
  }
})

// Función para decodificar JWT y extraer datos del usuario
const decodificarToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error al decodificar token:', error)
    return null
  }
}

// Función para cargar datos del usuario
const cargarDatosUsuario = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    // Configurar axios con el token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Intentar decodificar el token primero
    const datosToken = decodificarToken(token)
    if (datosToken && datosToken.nombre) {
      nombreUsuario.value = datosToken.nombre
      // Si el token contiene información del rol, usarla temporalmente
      if (datosToken.rol) {
        rolUsuario.value = datosToken.rol
        esAdministrador.value = datosToken.rol === 'Administrador'
      }
    }
    
    // También intentar obtener datos frescos del servidor
    try {
      const response = await axios.get('/api/usuarios/perfil')
      if (response.data) {
        nombreUsuario.value = response.data.nombre || 'Usuario'
        correoUsuario.value = response.data.correo || ''
        
        // Obtener nombre del rol si existe id_rol
        if (response.data.id_rol) {
          try {
            const rolResponse = await axios.get(`/api/roles/${response.data.id_rol}`)
            if (rolResponse.data) {
              rolUsuario.value = rolResponse.data.nombre || 'Sin rol'
              // Verificar si es administrador
              esAdministrador.value = rolResponse.data.nombre === 'Administrador'
            }
          } catch (rolError) {
            rolUsuario.value = 'Sin rol'
            esAdministrador.value = false
          }
        }
      }
    } catch (error) {
      // Si falla la petición al servidor, mantener los datos del token
      console.warn('No se pudo obtener perfil del servidor, usando datos del token')
    }
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
    nombreUsuario.value = 'Usuario'
  }
}

// Funciones para manejar errores de carga de imagen
const onNavImageError = () => {
  console.warn('Error al cargar logo de navegación')
  navLogoLoaded.value = false
}

const onNavImageLoad = () => {
  navLogoLoaded.value = true
}

const onAppbarImageError = () => {
  console.warn('Error al cargar logo de appbar')
  appbarLogoLoaded.value = false
}

const onAppbarImageLoad = () => {
  appbarLogoLoaded.value = true
}

const logout = () => {
  localStorage.removeItem('token')
  delete axios.defaults.headers.common['Authorization']
  router.push('/')
}

// Cargar datos del usuario al montar el componente
onMounted(() => {
  cargarDatosUsuario()
})
</script>

<style scoped>
/* Navegación lateral */
.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Logo en navegación lateral */
.logo-nav-container {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-nav-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo-nav-image:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logo-nav-fallback {
  margin-right: 0 !important;
}

/* Logo en app bar */
.logo-appbar-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-appbar-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px;
  transition: all 0.3s ease;
}

.logo-appbar-image:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.logo-appbar-fallback {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Header del logo en la navegación */
.logo-header {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(123, 31, 162, 0.05) 100%);
  border-radius: 0 0 16px 16px;
  margin-bottom: 8px;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 600;
}

/* Items de navegación activos */
.v-list-item--active {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-right: 3px solid #1976D2;
  color: #1976D2 !important;
  font-weight: 600;
}

.v-list-item--active .v-icon {
  color: #1976D2 !important;
}

/* Hover effects para items de navegación */
.v-list-item {
  border-radius: 0 24px 24px 0;
  margin: 2px 8px 2px 0;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background: rgba(25, 118, 210, 0.05);
  transform: translateX(4px);
}

/* App bar mejorada */
.v-app-bar {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%) !important;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 
              0 4px 5px 0 rgba(0, 0, 0, 0.14), 
              0 1px 10px 0 rgba(0, 0, 0, 0.12) !important;
}

.v-app-bar-title {
  font-size: 1.4rem;
}

/* Avatar en app bar */
.v-app-bar .v-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Chip de usuario */
.v-chip {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-chip {
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-chip:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 960px) {
  .logo-text {
    font-size: 1.1rem;
  }
  
  .v-list-item {
    margin: 1px 4px 1px 0;
    border-radius: 0 20px 20px 0;
  }
}

/* Animaciones */
.logo-header .v-avatar {
  animation: subtlePulse 4s ease-in-out infinite;
}

@keyframes subtlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Botones con efectos */
.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Main content */
.v-main {
  background: #f8f9fa;
}
</style>
