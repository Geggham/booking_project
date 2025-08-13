<template>
  <div class="booking-table" v-if="tables.length && timeSlots.length">
    <table>
      <thead>
        <tr>
          <th class="opac"></th>
          <th class="opac" v-for="table in tables" :key="table.id">
            <div>#{{ table.number }} {{ table.capacity }} чел</div>
            <div>{{ table.zone }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="time in timeSlots" :key="time">
          <td class="opac time-cell">{{ time }}</td>
          <td v-for="table in tables" :key="table.id">
            <div class="cards-container">
              <BookingReservations
                v-for="res in getReservationsForTableAtTime(table.id, time)"
                :key="res.id"
                :reservation="res"
                :card-width="calculateCardWidth(table.id, time)"
                :offset="res.offset || 0"
                :offset-vertical="calculateVerticalOffset(res, time)"
              />
              <BookingOrders
                v-for="ord in getOrdersForTableAtTime(table.id, time)"
                :key="ord.id"
                :order="ord"
                :card-width="calculateCardWidth(table.id, time)"
                :offset="ord.offset || 0"
                :offset-vertical="calculateVerticalOffset(ord, time)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else>Загружаем данные...</div>
</template>

<script lang="ts" setup>
import { defineProps, computed } from "vue";
import BookingReservations from "./bookingReservations.vue";
import BookingOrders from "./bookingOrders.vue";

interface Reservation {
  id: string | number;
  seating_time: string;
  end_time: string;
  status: string;
  offset?: number;
}

interface Order {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  offset?: number;
}

interface Table {
  id: string;
  number: string | number;
  capacity: number;
  zone: string;
  reservations: Reservation[];
  orders: Order[];
}

const props = defineProps<{
  tables: Table[];
  timeSlots: string[];
  selectedDate: string;
}>();

function getTimeHHMM(dateString: string): string {
  const match = dateString.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

const reservationsByTable = computed(() => {
  return props.tables.map((table) => ({
    tableId: table.id,
    reservations: table.reservations.filter((res) => {
      const resDate = new Date(res.seating_time).toISOString().split("T")[0];
      return resDate === props.selectedDate;
    }),
  }));
});

const ordersByTable = computed(() => {
  return props.tables.map((table) => ({
    tableId: table.id,
    orders: table.orders.filter((ord) => {
      const ordDate = new Date(ord.start_time).toISOString().split("T")[0];
      return ordDate === props.selectedDate;
    }),
  }));
});

const getReservationsForTableAtTime = (
  tableId: string,
  time: string
): Reservation[] => {
  const tableRes = reservationsByTable.value.find((t) => t.tableId === tableId);
  if (!tableRes) return [];

  const events = tableRes.reservations
    .filter((res) => getTimeHHMM(res.seating_time) === time)
    .sort(
      (a, b) =>
        new Date(a.seating_time).getTime() - new Date(b.seating_time).getTime()
    );

  let lastEnd: number | null = null;
  events.forEach((res) => {
    const start = new Date(res.seating_time).getTime();
    if (lastEnd && start < lastEnd) {
      res.offset = 4;
    } else {
      res.offset = 0;
    }
    lastEnd = new Date(res.end_time).getTime();
  });

  return events;
};

const getOrdersForTableAtTime = (tableId: string, time: string): Order[] => {
  const tableOrd = ordersByTable.value.find((t) => t.tableId === tableId);
  if (!tableOrd) return [];

  const events = tableOrd.orders
    .filter((ord) => getTimeHHMM(ord.start_time) === time)
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  let lastEnd: number | null = null;
  events.forEach((ord) => {
    const start = new Date(ord.start_time).getTime();
    if (lastEnd && start < lastEnd) {
      ord.offset = 4;
    } else {
      ord.offset = 0;
    }
    lastEnd = new Date(ord.end_time).getTime();
  });

  return events;
};

const calculateCardWidth = (tableId: string, time: string): string => {
  const reservations = getReservationsForTableAtTime(tableId, time);
  const orders = getOrdersForTableAtTime(tableId, time);

  const totalCards = reservations.length + orders.length;

  if (totalCards === 1) return "100%";
  if (totalCards === 2) return "50%";
  if (totalCards >= 3) return "33.33%";

  return "100%";
};

const calculateVerticalOffset = (
  event: Reservation | Order,
  time: string
): number => {
  const eventTime = new Date(
    "start_time" in event ? event.start_time : event.seating_time
  ).getTime();
  const timeSlotStart = new Date(`${props.selectedDate}T${time}`).getTime();
  const timeSlotEnd = timeSlotStart + 30 * 60 * 1000;

  if (eventTime < timeSlotEnd && eventTime >= timeSlotStart) {
    return Math.floor((eventTime - timeSlotStart) / (30 * 60 * 1000));
  }

  return 0;
};
</script>

<style scoped>
.booking-table {
  overflow-x: auto; /* горизонтальный скролл */
}

table {
  border-collapse: collapse;
  table-layout: fixed;
  min-width: max-content; /* не сжимать колонки */
}

th,
td {
  border: 1px solid gray;
  padding: 0;
  height: 40px; /* фиксированная высота */
  width: 80px; /* фиксированная ширина */
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: top;
}

.opac {
  border: none;
  color: #848080;
}

th {
  text-align: left;
}

.time-cell {
  font-weight: bold;
}

td {
  position: relative;
}

.cards-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  position: relative;
  align-items: flex-start;
  padding-top: 2px;
}
</style>
