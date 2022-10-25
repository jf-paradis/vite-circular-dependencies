<script setup lang="ts">
defineProps<{ msg: string, title: string }>()
</script>

<template>
  <div>{{ title }} {{ msg }}</div>
</template>
