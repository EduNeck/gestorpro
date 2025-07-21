<template>
  <v-app>
    <!-- Fondo con gradiente -->
    <v-main class="login-background">
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <!-- Panel de login -->
          <v-col cols="12" sm="8" md="6" lg="4" xl="3">
            <v-card 
              class="login-card elevation-24"
              rounded="xl"
            >
              <!-- Header con logo -->
              <v-card-text class="text-center pa-8">
                <!-- Logo del sistema -->
                <div class="logo-container mb-6">
                  <div class="logo-image-container mb-4">
                    <img 
                      :src="logoImage" 
                      alt="GestorPro Logo" 
                      class="logo-image"
                      @error="onImageError"
                      @load="onImageLoad"
                    />
                    <!-- Fallback si no se encuentra la imagen -->
                    <v-avatar 
                      v-if="!logoLoaded"
                      size="80" 
                      color="primary"
                      class="logo-fallback"
                    >
                      <v-icon size="40" color="white">mdi-briefcase-variant</v-icon>
                    </v-avatar>
                  </div>
                  
                  <h1 class="logo-title">
                    <span class="text-primary font-weight-bold">Gestor</span><span class="text-secondary">Pro</span>
                  </h1>
                  
                  <p class="text-body-2 text-medium-emphasis mt-2">
                    Sistema de Gestión de Proyectos
                  </p>
                </div>

                <!-- Formulario de login -->
                <v-form @submit.prevent="login" ref="formulario">
                  <v-text-field
                    v-model="correo"
                    label="Correo electrónico"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    density="comfortable"
                    :rules="[reglas.requerido, reglas.email]"
                    class="mb-3"
                    :loading="cargando"
                    :disabled="cargando"
                  ></v-text-field>

                  <v-text-field
                    v-model="contrasena"
                    label="Contraseña"
                    :type="verContrasena ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="verContrasena ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="verContrasena = !verContrasena"
                    variant="outlined"
                    density="comfortable"
                    :rules="[reglas.requerido]"
                    class="mb-4"
                    :loading="cargando"
                    :disabled="cargando"
                  ></v-text-field>

                  <v-btn
                    color="primary"
                    type="submit"
                    size="large"
                    block
                    rounded="lg"
                    :loading="cargando"
                    :disabled="cargando"
                    class="mb-4 login-btn"
                  >
                    <v-icon start>mdi-login</v-icon>
                    Iniciar Sesión
                  </v-btn>
                </v-form>

                <!-- Mensaje de error -->
                <v-slide-y-transition>
                  <v-alert
                    v-if="mensajeError"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    rounded="lg"
                  >
                    <v-icon start>mdi-alert-circle</v-icon>
                    {{ mensajeError }}
                  </v-alert>
                </v-slide-y-transition>

                <!-- Footer -->
                <div class="text-center mt-6">
                  <v-chip variant="text" size="small" class="text-caption">
                    <v-icon start size="small">mdi-shield-check</v-icon>
                    Acceso seguro protegido
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Footer de la aplicación -->
        <v-footer 
          app
          class="bg-transparent text-center pa-4"
        >
          <div class="text-body-2 text-medium-emphasis">
            © {{ new Date().getFullYear() }} GestorPro - Sistema de Gestión Empresarial
            <v-divider vertical class="mx-2"></v-divider>
            <v-icon size="small">mdi-heart</v-icon>
            Hecho con tecnología moderna By BenSolutions
          </div>
        </v-footer>
      </v-container>
    </v-main>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="mostrarSnackbar"
      :color="tipoMensaje"
      :timeout="4000"
      location="top"
    >
      {{ mensajeSnackbar }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="mostrarSnackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Importar el logo
let logoImage = null
try {
  logoImage = new URL('../assets/GestorPro.png', import.meta.url).href
} catch (error) {
  console.warn('Logo no encontrado en assets, usando fallback')
}

// Estado reactivo
const correo = ref('')
const contrasena = ref('')
const verContrasena = ref(false)
const mensajeError = ref('')
const cargando = ref(false)
const mostrarSnackbar = ref(false)
const mensajeSnackbar = ref('')
const tipoMensaje = ref('success')
const logoLoaded = ref(!!logoImage)

const router = useRouter()
const formulario = ref(null)

// Función para manejar error de carga de imagen
const onImageError = () => {
  console.warn('Error al cargar el logo desde assets')
  logoLoaded.value = false
}

// Función para manejar carga exitosa de imagen
const onImageLoad = () => {
  logoLoaded.value = true
}

// Reglas de validación
const reglas = {
  requerido: value => !!value || 'Este campo es requerido',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  }
}

// Función de login mejorada
const login = async () => {
  // Limpiar errores previos
  mensajeError.value = ''
  
  // Validar formulario
  if (!formulario.value) return
  
  const { valid } = await formulario.value.validate()
  if (!valid) return

  cargando.value = true

  try {
    const response = await axios.post('/api/auth/login', {
      correo: correo.value,
      contrasena: contrasena.value
    })

    const token = response.data.token
    localStorage.setItem('token', token)

    // Mensaje de éxito
    mostrarMensaje('¡Bienvenido a GestorPro!', 'success')
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      router.push('/proyectos')
    }, 1000)

  } catch (error) {
    console.error('Error de login:', error)
    
    const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión'
    mensajeError.value = mensaje
    mostrarMensaje(mensaje, 'error')
  } finally {
    cargando.value = false
  }
}

// Función para mostrar mensajes
const mostrarMensaje = (mensaje, tipo = 'info') => {
  mensajeSnackbar.value = mensaje
  tipoMensaje.value = tipo
  mostrarSnackbar.value = true
}

// Verificar si ya está logueado al cargar la página
const verificarLogin = () => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/proyectos')
  }
}

// Ejecutar verificación al montar el componente
verificarLogin()
</script>

<style scoped>
/* Fondo con gradiente */
.login-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
}

.login-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

/* Tarjeta de login */
.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    0 0 0 1px rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 12px 40px 0 rgba(31, 38, 135, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.2) !important;
}

/* Logo y branding */
.logo-container {
  animation: fadeInUp 0.8s ease-out;
}

.logo-avatar {
  animation: logoFloat 3s ease-in-out infinite;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%) !important;
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
}

.logo-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
  background: linear-gradient(135deg, #1976D2 0%, #7B1FA2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Botón de login */
.login-btn {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%) !important;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.6);
}

.login-btn:active {
  transform: translateY(0);
}

/* Logo personalizado */
.logo-image-container {
  position: relative;
  display: inline-block;
}

.logo-image {
  width: 120px;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: logoFloat 3s ease-in-out infinite;
  transition: all 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.logo-fallback {
  animation: logoFloat 3s ease-in-out infinite;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Campos de formulario */
.v-text-field {
  transition: all 0.3s ease;
}

.v-text-field:hover {
  transform: translateY(-1px);
}

/* Footer transparente */
.v-footer {
  background: transparent !important;
  backdrop-filter: blur(10px);
}

/* Responsividad */
@media (max-width: 600px) {
  .logo-title {
    font-size: 1.8rem;
  }
  
  .login-card {
    margin: 16px;
  }
  
  .logo-avatar {
    width: 60px !important;
    height: 60px !important;
  }
  
  .logo-avatar .v-icon {
    font-size: 30px !important;
  }
}

/* Efectos adicionales */
.v-alert {
  animation: slideInDown 0.3s ease;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chip de seguridad */
.v-chip {
  background: rgba(25, 118, 210, 0.1) !important;
  color: rgba(25, 118, 210, 0.8) !important;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

/* Loading states */
.v-text-field.v-input--disabled {
  opacity: 0.7;
}

/* Mejoras de accesibilidad */
.login-card:focus-within {
  outline: 2px solid rgba(25, 118, 210, 0.5);
  outline-offset: 2px;
}
</style>
