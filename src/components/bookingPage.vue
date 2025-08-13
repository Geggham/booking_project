<template>
  <div>
    <TopBar :restaurantName="restaurantName" />
    <div class="container">
      <h1 class="title">Бронирования</h1>
      <div class="info">
        <h1 class="text1">дата</h1>
        <div class="buttons">
          <div v-for="(day, index) in orderedDays" :key="index">
            <button
              class="booking-btn"
              :class="{
                'current-day': day === currentDay,
                'selected-day': day === selectedDate,
              }"
              @click="selectDate(day)"
            >
              <span class="date-text">{{ formatDate(day) }}</span>
              <span class="day-text" v-if="day === currentDay">сегодня</span>
              <span class="day-text" v-else-if="isTomorrow(day)">завтра</span>
              <span class="day-text" v-else-if="isDayAfterTomorrow(day)">
                послезавтра
              </span>
              <span class="day-text" v-else>{{ getWeekDay(day) }}</span>
            </button>
          </div>
        </div>

        <h1 class="text1">отображение зоны</h1>
        <div class="zone-buttons">
          <div v-for="(zone, index) in uniqueZones" :key="index">
            <button
              class="zone-btn"
              :class="{ active: selectedZones.includes(zone) }"
              @click="selectZone(zone)"
            >
              {{ zone }}
            </button>
          </div>
        </div>

        <BookingTable
          :tables="filteredTables"
          :timeSlots="timeSlots"
          :selectedDate="selectedDate"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { Table, BookingData } from "../types/table";
import getBookingData from "../api/api";
import BookingTable from "./bookingTable.vue";
import TopBar from "./topBar.vue";

export default defineComponent({
  name: "BookingPage",
  components: { BookingTable, TopBar },
  setup() {
    const restaurantName = ref("");
    const availableDays = ref<string[]>([]);
    const currentDay = ref<string>("");
    const orderedDays = ref<string[]>([]);
    const tables = ref<Table[]>([]);
    const uniqueZones = ref<string[]>([]);
    const timeSlots = ref<string[]>([]);
    const selectedZones = ref<string[]>([]);
    const selectedDate = ref<string>("");

    function generateTimeSlots(open: string, close: string) {
      const slots: string[] = [];
      const [openH, openM] = open.split(":").map(Number);
      const [closeH, closeM] = close.split(":").map(Number);
      let current = new Date();
      current.setHours(openH, openM, 0, 0);
      const end = new Date();
      end.setHours(closeH, closeM, 0, 0);
      while (current <= end) {
        const hh = String(current.getHours()).padStart(2, "0");
        const mm = String(current.getMinutes()).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
        current.setMinutes(current.getMinutes() + 30);
      }
      return slots;
    }

    onMounted(async () => {
      try {
        const data: BookingData = await getBookingData();
        restaurantName.value = data.restaurant.restaurant_name;
        availableDays.value = data.available_days;
        currentDay.value = data.current_day;
        tables.value = [...data.tables].sort((a, b) => {
          if (a.zone === b.zone) {
            return Number(a.number) - Number(b.number);
          }
          return a.zone.localeCompare(b.zone);
        });
        timeSlots.value = generateTimeSlots(
          data.restaurant.opening_time,
          data.restaurant.closing_time
        );
        sortDays();
        extractUniqueZones();

        selectedZones.value = uniqueZones.value.slice(0, 2);

        selectedDate.value = currentDay.value;
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    });

    const sortDays = () => {
      const currentDayIndex = availableDays.value.indexOf(currentDay.value);
      const beforeCurrent = availableDays.value.slice(0, currentDayIndex);
      const afterCurrent = availableDays.value.slice(currentDayIndex);
      orderedDays.value = [...afterCurrent, ...beforeCurrent];
    };

    const extractUniqueZones = () => {
      const zones: string[] = tables.value.map((table: Table) => table.zone);
      uniqueZones.value = Array.from(new Set(zones));
    };

    const selectZone = (zone: string) => {
      if (selectedZones.value.includes(zone)) {
        selectedZones.value = selectedZones.value.filter((z) => z !== zone);
      } else {
        selectedZones.value.push(zone);
      }
    };

    const filteredTables = computed(() => {
      return tables.value.filter((table: Table) => selectedZones.value.includes(table.zone));
    });

    const formatDate = (date: string) => {
      const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
      };
      return new Date(date).toLocaleDateString("ru-RU", options);
    };

    const isTomorrow = (day: string) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatDate(day) === formatDate(tomorrow.toISOString());
    };

    const isDayAfterTomorrow = (day: string) => {
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      return formatDate(day) === formatDate(dayAfterTomorrow.toISOString());
    };

    const getWeekDay = (date: string) => {
      const options: Intl.DateTimeFormatOptions = { weekday: "long" };
      return new Date(date).toLocaleDateString("ru-RU", options);
    };

    const selectDate = (day: string) => {
      selectedDate.value = day;
    };

    return {
      restaurantName,
      availableDays,
      currentDay,
      orderedDays,
      uniqueZones,
      selectedZones,
      selectZone,
      filteredTables,
      formatDate,
      isTomorrow,
      isDayAfterTomorrow,
      getWeekDay,
      timeSlots,
      selectedDate,
      selectDate,
    };
  },
});
</script>

<style scoped>
.container {
  padding-top: 15px;
  position: relative;
  top: 44px;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  color: seashell;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
}

.info {
  display: flex;
  flex-direction: column;
}

.text1 {
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 12px;
}

.buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  padding-bottom: 30px;
  justify-content: flex-start;
  overflow-x: auto;
}

.booking-btn {
  border: none;
  outline: none;
  border-radius: 8px;
  background-color: #ffffff0a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  min-width: 80px;
  height: 60px;
}

.selected-day {
  background-color: #007bff;
}

.date-text {
  font-size: 16px;
  font-weight: bold;
}

.day-text {
  font-size: 12px;
  color: #a9a9a9;
}

.zone-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  padding-bottom: 55px;
  justify-content: flex-start;
  overflow-x: auto;
}

.zone-btn {
  border: none;
  outline: none;
  height: 32px;
  border-radius: 8px;
  background-color: #ffffff0a;
  color: white;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  min-width: 110px;
  transition: background-color 0.3s;
}

.zone-btn.active {
  background-color: #007bff;
  color: white;
}

.zone-btn:active {
  background-color: #007bff;
}
</style>
