<template>
  <section class="rounded-sm border border-base-300 bg-base-100 p-8">
    <h1 class="mb-2 text-2xl font-semibold">404 — сторінку не знайдено</h1>
    <p class="mb-5">Перевірте адресу або поверніться до реєстру.</p>
    <RouterLink :to="{ name: 'registry' }" class="btn btn-neutral rounded-sm">До реєстру</RouterLink>
  </section>
</template>
