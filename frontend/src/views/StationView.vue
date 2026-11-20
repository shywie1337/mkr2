<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import { Gauge, Pencil, Plus, Trash2 } from '@lucide/vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useStation } from '../composables/useStation'
import { formatDate, formatNumber } from '../labels'
import type { MeterInput } from '../types'

const id = useRoute().params.id as string
const { station, loading, error, load, changing, fields, meterError, add, remove } = useStation(id)
const initial = { model: '', serialNumber: '', pipeType: 'supply' as MeterInput['pipeType'], currentTemp: '' as number | '', verificationDueDate: '' }
const form = reactive({ ...initial })

async function submit() {
  if (await add({ ...form, currentTemp: Number(form.currentTemp) })) Object.assign(form, initial)
}
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'registry' }" class="link link-hover text-sm">До реєстру</RouterLink>
    <p v-if="loading" role="status" class="mt-4 flex gap-2"><span class="loading loading-spinner loading-sm" /> Завантаження картки…</p>
    <div v-else-if="error" role="alert" class="alert alert-error mt-4">
      <span>{{ error }}</span><button type="button" class="btn btn-sm" @click="load">Повторити</button>
    </div>
    <template v-if="station">
      <div class="my-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-semibold">{{ station.name }}</h1><StatusBadge :status="station.status" />
        </div>
        <RouterLink :to="{ name: 'station-edit', params: { id } }" class="btn btn-outline rounded-sm"><Pencil :size="17" aria-hidden="true" /> Редагувати</RouterLink>
      </div>
      <dl class="mb-6 grid gap-4 rounded-sm border border-base-300 bg-base-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div><dt class="text-sm text-base-content/70">Адреса</dt><dd class="break-words">{{ station.address }}</dd></div>
        <div><dt class="text-sm text-base-content/70">Район</dt><dd>{{ station.district }}</dd></div>
        <div><dt class="text-sm text-base-content/70">Навантаження</dt><dd>{{ formatNumber(station.thermalLoad) }} Гкал/год</dd></div>
        <div><dt class="text-sm text-base-content/70">Будівлі</dt><dd>{{ station.connectedBuildings }}</dd></div>
        <div><dt class="text-sm text-base-content/70">Останній огляд</dt><dd>{{ formatDate(station.lastInspectionDate) }}</dd></div>
      </dl>
      <div class="grid items-start gap-5 lg:grid-cols-2">
        <section>
          <h2 class="mb-3 flex items-center gap-2 text-xl font-semibold"><Gauge :size="20" aria-hidden="true" /> Вузли обліку</h2>
          <p v-if="!station.meters.length" class="rounded-sm border border-base-300 bg-base-100 p-4">Приладів ще немає.</p>
          <ul v-else class="space-y-3">
            <li v-for="meter in station.meters" :key="meter.id" class="rounded-sm border border-base-300 bg-base-100 p-4">
              <div class="flex items-start justify-between gap-3">
                <div><h3 class="font-semibold">{{ meter.model }}</h3><p class="text-sm">Серійний номер: {{ meter.serialNumber }}</p></div>
                <button type="button" class="btn btn-ghost btn-sm text-error" :disabled="changing" :aria-label="'Видалити прилад ' + meter.serialNumber" @click="remove(meter.id)"><Trash2 :size="17" aria-hidden="true" /></button>
              </div>
              <p class="mt-2 text-sm">{{ meter.pipeType === 'supply' ? 'Подавальний' : 'Зворотний' }} трубопровід · {{ formatNumber(meter.currentTemp) }} °C</p>
              <p class="text-sm">Наступна повірка: {{ formatDate(meter.verificationDueDate) }}</p>
            </li>
          </ul>
        </section>
        <section class="rounded-sm border border-base-300 bg-base-100 p-4 sm:p-5">
          <h2 class="mb-4 text-xl font-semibold">Додати вузол обліку</h2>
          <form @submit.prevent="submit">
            <fieldset class="grid gap-3 sm:grid-cols-2" :disabled="changing">
              <label class="grid gap-1 text-sm">Модель<input v-model="form.model" class="input w-full rounded-sm" required minlength="2" maxlength="40" /><span v-if="fields.model" class="text-error">{{ fields.model }}</span></label>
              <label class="grid gap-1 text-sm">Серійний номер<input v-model="form.serialNumber" class="input w-full rounded-sm" required minlength="4" maxlength="20" /><span v-if="fields.serialNumber" class="text-error">{{ fields.serialNumber }}</span></label>
              <label class="grid gap-1 text-sm">Трубопровід<select v-model="form.pipeType" class="select w-full rounded-sm"><option value="supply">Подавальний</option><option value="return">Зворотний</option></select><span v-if="fields.pipeType" class="text-error">{{ fields.pipeType }}</span></label>
              <label class="grid gap-1 text-sm">Температура, °C<input v-model="form.currentTemp" class="input w-full rounded-sm" type="number" min="10" max="150" step="any" required /><span v-if="fields.currentTemp" class="text-error">{{ fields.currentTemp }}</span></label>
              <label class="grid gap-1 text-sm">Термін повірки<input v-model="form.verificationDueDate" class="input w-full rounded-sm" type="date" required /><span v-if="fields.verificationDueDate" class="text-error">{{ fields.verificationDueDate }}</span></label>
            </fieldset>
            <p v-if="meterError" role="alert" class="alert alert-error mt-3">{{ meterError }}</p>
            <p v-if="changing" role="status" class="mt-3 flex gap-2"><span class="loading loading-spinner loading-sm" /> Оновлення вузлів обліку…</p>
            <button type="submit" class="btn btn-neutral mt-4 rounded-sm" :disabled="changing"><Plus :size="17" aria-hidden="true" /> Додати прилад</button>
          </form>
        </section>
      </div>
    </template>
  </section>
</template>
