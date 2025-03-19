import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import * as Calendar from "expo-calendar";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";

export default function App() {
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [markedDates, setMarkedDates] = useState<{
    [date: string]: { selected: boolean; marked?: boolean };
  }>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const fetchedCalendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );
        setCalendars(fetchedCalendars);
        loadEvents(fetchedCalendars);
      }
    })();
  }, []);

  async function loadEvents(fetchedCalendars: Calendar.Calendar[]) {
    let events: Calendar.Event[] = [];

    for (let calendar of fetchedCalendars) {
      const calendarEvents = await Calendar.getEventsAsync(
        [calendar.id],
        new Date(),
        new Date(new Date().setDate(new Date().getDate() + 30))
      );
      events = [...events, ...calendarEvents];
    }

    const markedDatesObj: {
      [date: string]: { selected: boolean; marked?: boolean };
    } = {};
    events.forEach((event) => {
      const eventDate =
        typeof event.startDate === "string"
          ? event.startDate.split("T")[0]
          : event.startDate.toISOString().split("T")[0];

      markedDatesObj[eventDate] = { selected: false, marked: true };
    });

    setMarkedDates(markedDatesObj);
  }

  async function createEvent() {
    if (!selected) {
      alert("Selecione um dia no calendário primeiro!");
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    const defaultCalendar = calendars.find(
      (cal) => cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
    );

    if (!defaultCalendar) {
      alert("Nenhum calendário disponível!");
      return;
    }

    const selectedDate = new Date(selected);
    const newEventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: "Novo Evento",
      startDate: new Date(selectedDate.setHours(10, 0, 0)),
      endDate: new Date(selectedDate.setHours(11, 0, 0)),
      timeZone: "UTC",
      location: "Minha cidade",
    });

    setMarkedDates((prev) => ({
      ...prev,
      [selected]: { selected: true, marked: true },
    }));

    console.log(`Joke time: Por que o computador foi ao médico?
Porque estava com um vírus! 💻🤧}`);
    alert(
      "Joke Time! 🥕 Why don’t vegetables ever fight? Because they don’t want to get into a pickle!"
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Calendário</Text>

      {/* Calendário interativo */}
      <RNCalendar
        style={{
          borderWidth: 1,
          borderColor: "gray",
          height: 350,
        }}
        theme={{
          selectedDayBackgroundColor: "#00adf5",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#00adf5",
          dayTextColor: "#2d4150",
        }}
        onDayPress={(day: DateData) => {
          // 🔹 Tipagem correta
          setSelected(day.dateString);
          setMarkedDates((prev) => ({
            ...prev,
            [day.dateString]: { selected: true },
          }));
        }}
        markedDates={markedDates}
      />

      <Button title="Criar um novo evento" onPress={createEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
