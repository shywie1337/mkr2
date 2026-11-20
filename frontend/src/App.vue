<script setup lang="ts">
import { Factory } from '@lucide/vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <header class="border-b border-slate-700 bg-slate-900 text-slate-50">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <RouterLink :to="{ name: 'registry' }" class="flex items-center gap-3 font-semibold">
          <Factory :size="23" aria-hidden="true" /> Диспетчерська тепломережі
        </RouterLink>
        <nav aria-label="Основна навігація" class="flex gap-2">
          <RouterLink :to="{ name: 'registry' }" class="rounded-sm px-3 py-2 text-sm hover:bg-slate-800" exact-active-class="bg-slate-700 font-semibold">Реєстр ІТП</RouterLink>
          <RouterLink :to="{ name: 'analytics' }" class="rounded-sm px-3 py-2 text-sm hover:bg-slate-800" exact-active-class="bg-slate-700 font-semibold">Аналітика</RouterLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </RouterView>
    </main>
  </div>
</template>
