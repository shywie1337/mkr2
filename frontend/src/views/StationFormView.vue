<script setup lang="ts">
import { useRoute } from 'vue-router'
import { districts, statuses } from '../types'
import { statusNames } from '../labels'
import { useStationForm } from '../composables/useStationForm'

const id = useRoute().params.id as string | undefined
const { form, errors, loading, loadError, saving, error, load, save } = useStationForm(id)
</script>

<template>
  <section class="max-w-3xl">
    <RouterLink :to="{ name: 'registry' }" class="link link-hover text-sm">До реєстру</RouterLink>
    <h1 class="my-4 text-3xl font-semibold">{{ id ? 'Редагувати ІТП' : 'Новий тепловий пункт' }}</h1>
    <p v-if="loading" role="status" class="flex gap-2"><span class="loading loading-spinner loading-sm" /> Завантаження…</p>
    <div v-else-if="loadError" role="alert" class="alert alert-error">
      <span>{{ loadError }}</span><button type="button" class="btn btn-sm" @click="load">Повторити</button>
    </div>
    <form v-else class="rounded-sm border border-base-300 bg-base-100 p-4 sm:p-6" novalidate @submit.prevent="save">
      <fieldset class="grid gap-4 sm:grid-cols-2" :disabled="saving">
        <label class="grid gap-1 text-sm">Назва
          <input v-model="form.name" class="input w-full rounded-sm" required minlength="3" maxlength="60" />
          <span v-if="errors.name" class="text-error" role="alert">{{ errors.name }}</span>
        </label>
        <label class="grid gap-1 text-sm">Адреса
          <input v-model="form.address" class="input w-full rounded-sm" required />
          <span v-if="errors.address" class="text-error" role="alert">{{ errors.address }}</span>
        </label>
        <label class="grid gap-1 text-sm">Район
          <select v-model="form.district" class="select w-full rounded-sm" required>
            <option value="" disabled>Оберіть район</option><option v-for="district in districts" :key="district">{{ district }}</option>
          </select>
          <span v-if="errors.district" class="text-error" role="alert">{{ errors.district }}</span>
        </label>
        <label class="grid gap-1 text-sm">Стан
          <select v-model="form.status" class="select w-full rounded-sm" required>
            <option v-for="status in statuses" :key="status" :value="status">{{ statusNames[status] }}</option>
          </select>
          <span v-if="errors.status" class="text-error" role="alert">{{ errors.status }}</span>
        </label>
        <label class="grid gap-1 text-sm">Теплове навантаження, Гкал/год
          <input v-model="form.thermalLoad" type="number" min="0.05" max="25" step="any" class="input w-full rounded-sm" required />
          <span v-if="errors.thermalLoad" class="text-error" role="alert">{{ errors.thermalLoad }}</span>
        </label>
        <label class="grid gap-1 text-sm">Підключені будівлі
          <input v-model="form.connectedBuildings" type="number" min="1" step="1" class="input w-full rounded-sm" required />
          <span v-if="errors.connectedBuildings" class="text-error" role="alert">{{ errors.connectedBuildings }}</span>
        </label>
        <label class="grid gap-1 text-sm">Дата останнього огляду
          <input v-model="form.lastInspectionDate" type="date" class="input w-full rounded-sm" required />
          <span v-if="errors.lastInspectionDate" class="text-error" role="alert">{{ errors.lastInspectionDate }}</span>
        </label>
      </fieldset>
      <p v-if="error" class="alert alert-error mt-4" role="alert">{{ error }}</p>
      <button class="btn btn-neutral mt-5 rounded-sm" :disabled="saving" type="submit">
        <span v-if="saving" class="loading loading-spinner loading-sm" /> {{ saving ? 'Збереження…' : 'Зберегти' }}
      </button>
    </form>
  </section>
</template>
