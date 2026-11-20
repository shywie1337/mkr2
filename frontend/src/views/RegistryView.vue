<script setup lang="ts">
import { Plus, RotateCcw, Trash2 } from '@lucide/vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useRegistry } from '../composables/useRegistry'
import { formatDate, formatNumber, statusNames } from '../labels'
import { districts, statuses } from '../types'

const { items, loading, error, deleting, deleteError, filters, filtered, setFilter, reset, load, remove } = useRegistry()
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-3xl font-semibold">Реєстр теплових пунктів</h1>
      <RouterLink :to="{ name: 'station-new' }" class="btn btn-neutral rounded-sm"><Plus :size="18" aria-hidden="true" /> Додати ІТП</RouterLink>
    </div>
    <div class="mb-5 grid gap-3 rounded-sm border border-base-300 bg-base-100 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <label class="grid gap-1 text-sm">Пошук
        <input type="search" class="input w-full rounded-sm" placeholder="Назва або адреса" :value="filters.search" @input="setFilter('search', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="grid gap-1 text-sm">Район
        <select class="select w-full rounded-sm" :value="filters.district" @change="setFilter('district', ($event.target as HTMLSelectElement).value)">
          <option value="">Усі райони</option>
          <option v-for="district in districts" :key="district">{{ district }}</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm">Стан
        <select class="select w-full rounded-sm" :value="filters.status" @change="setFilter('status', ($event.target as HTMLSelectElement).value)">
          <option value="">Усі стани</option>
          <option v-for="status in statuses" :key="status" :value="status">{{ statusNames[status] }}</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm">Сортувати за
        <select class="select w-full rounded-sm" :value="filters.sortBy" @change="setFilter('sortBy', ($event.target as HTMLSelectElement).value)">
          <option value="name">Назвою</option><option value="thermalLoad">Навантаженням</option><option value="lastInspectionDate">Датою огляду</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm">Напрямок
        <select class="select w-full rounded-sm" :value="filters.sortOrder" @change="setFilter('sortOrder', ($event.target as HTMLSelectElement).value)">
          <option value="asc">За зростанням</option><option value="desc">За спаданням</option>
        </select>
      </label>
      <button type="button" class="btn btn-outline self-end rounded-sm" @click="reset"><RotateCcw :size="16" aria-hidden="true" /> Скинути</button>
    </div>
    <p v-if="deleteError" role="alert" class="alert alert-error mb-4">{{ deleteError }}</p>
    <p v-if="deleting" role="status" class="mb-4 flex items-center gap-2"><span class="loading loading-spinner loading-sm" /> Видалення…</p>
    <p v-if="loading" role="status" class="flex items-center gap-2"><span class="loading loading-spinner loading-sm" /> Завантаження реєстру…</p>
    <div v-else-if="error" role="alert" class="alert alert-error">
      <span>{{ error }}</span><button class="btn btn-sm" type="button" @click="load">Повторити</button>
    </div>
    <p v-else-if="!items.length" class="rounded-sm border border-base-300 bg-base-100 p-5">{{ filtered ? 'За цими фільтрами нічого не знайдено.' : 'Реєстр порожній. Додайте перший тепловий пункт.' }}</p>
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in items" :key="item.id" class="card rounded-sm border border-base-300 bg-base-100">
        <div class="card-body gap-3 p-4">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <h2 class="text-lg font-semibold"><RouterLink :to="{ name: 'station', params: { id: item.id } }" class="link link-hover">{{ item.name }}</RouterLink></h2>
            <StatusBadge :status="item.status" />
          </div>
          <p class="break-words">{{ item.address }}</p>
          <p class="text-sm text-base-content/70">{{ item.district }} · Огляд {{ formatDate(item.lastInspectionDate) }}</p>
          <div class="mt-1 flex items-center justify-between gap-3 border-t border-base-300 pt-3">
            <span class="text-sm">{{ formatNumber(item.thermalLoad) }} Гкал/год · Будівель: {{ item.connectedBuildings }}</span>
            <button type="button" class="btn btn-ghost btn-sm text-error" :aria-label="'Видалити ' + item.name" :disabled="deleting" @click="remove(item)"><Trash2 :size="17" aria-hidden="true" /></button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
