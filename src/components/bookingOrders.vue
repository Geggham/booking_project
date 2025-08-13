<template>
  <div
    class="order-card"
    :style="{ left: `${offset * 2}px`, height: `${cardHeight}px` }"
    :title="fullInfo"
  >
    <div class="left-bar" :style="{ backgroundColor: barColor }"></div>
    <div class="order-content">
      <div class="order-title">{{ titleText }}</div>
      <div class="status" :class="statusClass">{{ order.status }}</div>
      <div class="time">
        {{ formatTime(order.start_time) }} - {{ formatTime(order.end_time) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";

interface Order {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
}

const props = defineProps<{
  order: Order;
  offset?: number;
}>();

const offset = props.offset || 0;

const CELL_HEIGHT = 40;

function formatTime(dateString: string) {
  const match = dateString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "-";
}

const cardHeight = computed(() => {
  const start = new Date(props.order.start_time);
  const end = new Date(props.order.end_time);
  const diffMinutes = (end.getTime() - start.getTime()) / 60000;
  return Math.ceil(diffMinutes / 30) * CELL_HEIGHT;
});

const isBanquet = computed(
  () => props.order.status?.toLowerCase() === "banquet"
);

const titleText = computed(() => (isBanquet.value ? "Банкет" : "Заказ"));

const barColor = computed(() => (isBanquet.value ? "#7B439E" : "#7FD7CC"));

const statusClass = computed(() => {
  switch (props.order.status?.toLowerCase()) {
    case "new":
      return "status-new";
    case "closed":
      return "status-closed";
    case "bill":
      return "status-bill";
    case "banquet":
      return "status-banquet";
    default:
      return "";
  }
});

const fullInfo = computed(() => {
  return `Тип: ${titleText.value}
Статус: ${props.order.status}
Время: ${formatTime(props.order.start_time)} - ${formatTime(
    props.order.end_time
  )}`;
});
</script>

<style scoped>
.order-card {
  color: white;
  display: flex;
  background-color: #7fd7cc29;
  border-radius: 8px;
  overflow: hidden;
  font-size: 12px;
  position: absolute;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  user-select: none;
  width: 100%;
}
.order-card:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
}
.left-bar {
  width: 4px;
}
.order-content {
  flex: 1;
}
.order-title {
  font-weight: bold;
  margin-bottom: 2px;
}
.status {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  margin: 4px 0;
}
.status-new {
  background-color: #2196f3;
  color: white;
}
.status-closed {
  background-color: #8b4513;
  color: white;
}
.status-bill {
  background-color: #4caf50;
  color: white;
}
.status-banquet {
  background-color: #b348f729;
  color: black;
}
.time {
  color: #ccc;
  font-size: 11px;
}
.order-card:has(.status-banquet) {
  background-color: #b348f729;
}
</style>
