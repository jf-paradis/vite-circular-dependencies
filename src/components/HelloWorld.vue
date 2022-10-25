<script setup lang="ts">
import Panel from "./Panel.vue"
defineProps<{ msg: string }>()
</script>

<template>
  <Panel title="Hello" msg="Vite + Vue" />
</template>
