import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { stationService } from '../services/stations'
import type { FieldErrors, StationInput } from '../types'
import { useRequest } from './useRequest'

export function useStationForm(id?: string) {
  const router = useRouter()
  const form = reactive({
    name: '', address: '', district: '', status: 'normal',
    thermalLoad: '' as number | '', connectedBuildings: '' as number | '', lastInspectionDate: '',
  })
  const initial = ref(JSON.stringify(form))
  const dirty = computed(() => initial.value !== JSON.stringify(form))
  const errors = ref<FieldErrors>({})
  const { busy: loading, error: loadError, run: request } = useRequest()
  const { busy: saving, error, fields, run } = useRequest()

  async function load() {
    if (!id) return
    const station = await request(() => stationService.get(id))
    if (!station) return
    form.name = station.name
    form.address = station.address
    form.district = station.district
    form.status = station.status
    form.thermalLoad = station.thermalLoad
    form.connectedBuildings = station.connectedBuildings
    form.lastInspectionDate = station.lastInspectionDate
    initial.value = JSON.stringify(form)
  }

  function unload(event: BeforeUnloadEvent) {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = true
  }

  function confirmLeave() {
    return !dirty.value || window.confirm('Є незбережені зміни. Вийти з форми?')
  }

  onBeforeRouteLeave(confirmLeave)
  onBeforeRouteUpdate((to, from) => to.path === from.path || confirmLeave())
  onMounted(() => {
    window.addEventListener('beforeunload', unload)
    void load()
  })
  onUnmounted(() => window.removeEventListener('beforeunload', unload))

  async function save() {
    if (saving.value || loading.value) return
    fields.value = {}
    error.value = ''
    const name = form.name.trim()
    const address = form.address.trim()
    const thermalLoad = Number(form.thermalLoad)
    const connectedBuildings = Number(form.connectedBuildings)
    const validation: FieldErrors = {}
    if (name.length < 3 || name.length > 60) validation.name = 'Від 3 до 60 символів.'
    if (!address) validation.address = 'Вкажіть адресу.'
    if (!form.district) validation.district = 'Оберіть район.'
    if (!form.status) validation.status = 'Оберіть стан.'
    if (!Number.isFinite(thermalLoad) || thermalLoad < 0.05 || thermalLoad > 25) validation.thermalLoad = 'Від 0,05 до 25 Гкал/год.'
    if (!Number.isSafeInteger(connectedBuildings) || connectedBuildings < 1) validation.connectedBuildings = 'Ціле число від 1.'
    if (!form.lastInspectionDate) validation.lastInspectionDate = 'Вкажіть дату огляду.'
    errors.value = validation
    if (Object.keys(validation).length) return

    const station = await run(() => stationService.save({
      name, address, thermalLoad, connectedBuildings,
      district: form.district as StationInput['district'],
      status: form.status as StationInput['status'],
      lastInspectionDate: form.lastInspectionDate,
    }, id))
    if (station) {
      initial.value = JSON.stringify(form)
      await router.push({ name: 'station', params: { id: station.id } })
    }
  }

  return { form, errors: computed(() => ({ ...errors.value, ...fields.value })), loading, loadError, saving, error, load, save }
}
