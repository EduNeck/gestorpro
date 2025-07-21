<template>
  <v-app>
    <v-container class="d-flex justify-center align-center fill-height">
      <v-card width="400">
        <v-card-title>Iniciar Sesión</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              label="Correo"
              v-model="correo"
              type="email"
              required
            ></v-text-field>

            <v-text-field
              label="Contraseña"
              v-model="contrasena"
              :type="verContrasena ? 'text' : 'password'"
              :append-inner-icon="verContrasena ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="verContrasena = !verContrasena"
              required
            ></v-text-field>

            <v-btn color="primary" type="submit" block>Ingresar</v-btn>
          </v-form>

          <v-alert v-if="mensajeError" type="error" class="mt-3">
            {{ mensajeError }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const correo = ref('')
const contrasena = ref('')
const verContrasena = ref(false)
const mensajeError = ref('')
const router = useRouter()

const login = async () => {
  mensajeError.value = ''
  try {
    const response = await axios.post('/api/auth/login', {
      correo: correo.value,
      contrasena: contrasena.value
    })

    const token = response.data.token
    localStorage.setItem('token', token)

    router.push('/proyectos')
  } catch (error) {
    mensajeError.value =
      error.response?.data?.mensaje || 'Error al iniciar sesión'
  }
}
</script>
