<template>
  <div class="top-bar">
    <span>AIRESTO | {{ restaurantName }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ restaurantName: string }>()
</script>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 44px;
  background-color: #35363a;
  display: flex;
  align-items: center;
  padding-left: 33px;
  z-index: 1000;
}
.top-bar span {
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 11px;
  line-height: 14px;
  color: white;
}
</style>
