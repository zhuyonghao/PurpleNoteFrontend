<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 如果有token，获取用户信息
  if (userStore.token) {
    userStore.fetchUserProfile().catch(() => {
      userStore.logout()
    })
  }
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>

<style scoped>

</style>
