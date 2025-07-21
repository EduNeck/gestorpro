import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

// Función para decodificar JWT
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

// Función para verificar si el usuario es administrador
const esAdministrador = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return false

    // Configurar axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Obtener perfil del usuario
    const response = await axios.get('/api/usuarios/perfil')
    if (response.data && response.data.id_rol) {
      const rolResponse = await axios.get(`/api/roles/${response.data.id_rol}`)
      return rolResponse.data && rolResponse.data.nombre === 'Administrador'
    }
    return false
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error)
    return false
  }
}

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/proyectos',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Proyectos',
        component: () => import('@/pages/Proyectos.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/tareas',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Tareas',
        component: () => import('@/pages/Tareas.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminUsuarios',
        component: () => import('@/pages/AdminUsuarios.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // No hay token, redirigir al login
      next('/')
      return
    }

    // Verificar si el token es válido
    const datosToken = decodificarToken(token)
    if (!datosToken) {
      // Token inválido, limpiar y redirigir
      localStorage.removeItem('token')
      next('/')
      return
    }

    // Verificar si la ruta requiere permisos de administrador
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const esAdmin = await esAdministrador()
      if (!esAdmin) {
        // No es administrador, redirigir a proyectos
        console.warn('Acceso denegado: Se requieren permisos de administrador')
        next('/proyectos?error=access_denied')
        return
      }
    }
  }

  // Redirigir al dashboard si ya está logueado y trata de ir al login
  if (to.path === '/' && token) {
    const datosToken = decodificarToken(token)
    if (datosToken) {
      next('/proyectos')
      return
    }
  }

  next()
})

export default router
