<template>
  <div
    class="reservation-card"
    :style="{ left: `${offset * 4}px`, height: `${cardHeight}px` }"
    :title="fullInfo"
  >
    <div class="left-bar"></div>
    <div class="reservation-content">
      <div class="reservation-id">№{{ reservation.id }}</div>
      <div class="reservation-name">
        {{ reservation.name_for_reservation }}
        <span class="people">{{ reservation.num_people }} чел</span>
      </div>
      <div class="status" :class="statusClass">{{ reservation.status }}</div>
      <div class="phone">📞{{ reservation.phone_number || "-" }}</div>
      <div class="time">
        {{ formatTime(reservation.seating_time) }} - {{ formatTime(reservation.end_time) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";

interface Reservation {
  id: number | string;
  name_for_reservation: string;
  num_people: number;
  seating_time: string;
  end_time: string;
  phone_number?: string;
  status?: string;
}

const props = defineProps<{
  reservation: Reservation;
  offset?: number;
}>();

const offset = props.offset || 0;

const CELL_HEIGHT = 40;

function formatTime(dateString: string) {
  const timePart = dateString.split("T")[1].slice(0, 5);
  return timePart;
}

const cardHeight = computed(() => {
  const start = new Date(props.reservation.seating_time);
  const end = new Date(props.reservation.end_time);
  const diffMinutes = (end.getTime() - start.getTime()) / 60000;
  return Math.ceil(diffMinutes / 30) * CELL_HEIGHT;
});

const statusClass = computed(() => {
  switch (props.reservation.status?.toLowerCase()) {
    case "заявка":
      return "status-request";
    case "новая":
      return "status-new";
    case "открыт":
      return "status-open";
    case "закрыт":
      return "status-closed";
    case "ожидает подтверждения":
      return "status-pending";
    default:
      return "";
  }
});

const fullInfo = computed(() => {
  return `Имя: ${props.reservation.name_for_reservation}
Кол-во: ${props.reservation.num_people}
Телефон: ${props.reservation.phone_number || "-"}
Время: ${formatTime(props.reservation.seating_time)} - ${formatTime(
    props.reservation.end_time
  )}
Статус: ${props.reservation.status || "-"}`;
});
</script>

<style scoped>
.reservation-card {
  color:white;
  display: flex;
  background-color: rgba(255, 112, 67, 0.16);
  border-radius: 8px;
  overflow: hidden;
  font-size: 12px;
  position: absolute;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  user-select: none;
}

.reservation-card:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
}

.left-bar {
  width: 4px;
  background-color: #ff7043;
  min-height: 100%;
}

.reservation-content {
  flex: 1;
}

.reservation-id {
  font-weight: bold;
  margin-bottom: 2px;
}

.reservation-name {
  font-weight: 500;
}

.people {
  font-weight: normal;
  color: #ddd;
  font-size: 11px;
}

.status {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  margin: 4px 0;
}

.status-request {
  background-color: #2196f3;
  color: white;
}

.status-new {
  background-color: #ff6347;
  color: white;
}

.status-open {
  background-color: #4caf50;
  color: white;
}

.status-closed {
  background-color: #8b4513;
  color: white;
}

.status-pending {
  background-color: #50c0ff;
  color: white;
}

.phone {
  margin: 2px 0;
}

.time {
  color: #ccc;
  font-size: 11px;
}
</style>
