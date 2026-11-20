<script setup lang="ts">
import { Activity, CircleAlert, Factory, RefreshCw } from '@lucide/vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useMetrics } from '../composables/useMetrics'
import { formatNumber } from '../labels'
import { districts, statuses } from '../types'

const { metrics, busy, error, load } = useMetrics()
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-3xl font-semibold">Диспетчерська аналітика</h1>
      <button class="btn btn-outline rounded-sm" type="button" :disabled="busy" @click="load"><RefreshCw :size="17" aria-hidden="true" /> Оновити</button>
    </div>
    <p v-if="busy" role="status" class="mb-4 flex gap-2"><span class="loading loading-spinner loading-sm" /> Завантаження аналітики…</p>
    <p v-if="error" role="alert" class="alert alert-error mb-4">{{ error }}</p>
    <template v-if="metrics">
      <div class="mb-5 grid gap-4 sm:grid-cols-3">
        <div class="stat rounded-sm border border-base-300 bg-base-100"><div class="stat-title flex items-center gap-2"><Factory :size="18" aria-hidden="true" /> Усього ІТП</div><div class="stat-value">{{ metrics.totalSubstations }}</div></div>
        <div class="stat rounded-sm border border-base-300 bg-base-100"><div class="stat-title flex items-center gap-2"><CircleAlert :size="18" aria-hidden="true" /> Аварійні ІТП</div><div class="stat-value text-error">{{ metrics.byStatus.critical }}</div></div>
        <div class="stat rounded-sm border border-base-300 bg-base-100"><div class="stat-title flex items-center gap-2"><Activity :size="18" aria-hidden="true" /> Навантаження</div><div class="stat-value">{{ formatNumber(metrics.totalThermalLoad) }}</div><div class="stat-desc">Гкал/год</div></div>
      </div>
      <div class="grid items-start gap-4 lg:grid-cols-2">
        <section class="rounded-sm border border-base-300 bg-base-100 p-5">
          <h2 class="mb-4 text-xl font-semibold">Розподіл за районами</h2>
          <div v-for="district in districts" :key="district" class="mb-3">
            <div class="mb-1 flex justify-between gap-2"><span>{{ district }}</span><b>{{ metrics.byDistrict[district] }}</b></div>
            <progress class="progress progress-neutral w-full" :value="metrics.byDistrict[district]" :max="metrics.totalSubstations || 1" :aria-label="district" />
          </div>
        </section>
        <section class="rounded-sm border border-base-300 bg-base-100 p-5">
          <h2 class="mb-4 text-xl font-semibold">Робочі стани</h2>
          <div v-for="status in statuses" :key="status" class="flex items-center justify-between border-b border-base-300 py-3"><StatusBadge :status="status" /><b>{{ metrics.byStatus[status] }}</b></div>
        </section>
      </div>
    </template>
  </section>
</template>
