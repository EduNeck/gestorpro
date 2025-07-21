<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" permanent>
      <v-list>
        <v-list-item title="GestorPro" subtitle="Menú principal">
          <template v-slot:prepend>
            <v-icon color="primary">mdi-view-dashboard</v-icon>
          </template>
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
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="$vuetify.display.mobile"></v-app-bar-nav-icon>
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-briefcase</v-icon>
        GestorPro
      </v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-btn icon @click="logout" title="Cerrar sesión">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(true)

const logout = () => {
  localStorage.removeItem('token')
  router.push('/')
}
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.1);
  border-right: 3px solid #1976D2;
}
</style>
