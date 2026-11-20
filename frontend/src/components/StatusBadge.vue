<script setup lang="ts">
import { statusClasses, statusNames } from '../labels'
import type { Status } from '../types'
defineProps<{ status: Status }>()
</script>

<template>
  <span class="badge h-auto rounded-sm border-0 whitespace-nowrap" :class="statusClasses[status]">{{ statusNames[status] }}</span>
</template>
