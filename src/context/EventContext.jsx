import React, { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({});

  const dateKey = (d) => {
    if (!d) return "";
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    if (d instanceof Date && !isNaN(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    const parsed = new Date(d);
    if (!isNaN(parsed)) return dateKey(parsed);
    return String(d);
  };

  // ------------------------------
  // 年ごとの固定イベントを追加する関数
  // ------------------------------
  const addFixedEvents = (eventsObj) => {
    const years = [];
    for (let y = 2024; y <= 2100; y++) {
      years.push(y);
    }
    years.forEach((y) => {
      const key = `${y}-03-10`;
      if (!eventsObj[key]) eventsObj[key] = [];
      // 既に追加済みか確認
      const exists = eventsObj[key].some((ev) => ev.id?.startsWith("birthday_"));
      if (!exists) {
        eventsObj[key].push({
          id: `birthday_${y}`,
          type: "schedule",
          title: "生誕・周年記念🎂",
        });
      }
    });
    return eventsObj;
  };

  const refreshFromStorages = () => {
    const newEvents = {};

    try {
      const stream = JSON.parse(localStorage.getItem("streamLogs") || "{}");
      Object.entries(stream).forEach(([dk, arr]) => {
        arr.forEach((entry, idx) => {
          if (!newEvents[dk]) newEvents[dk] = [];
          newEvents[dk].push({
            id: `stream_${dk}_${idx}`,
            type: "stream",
            title: entry.title || "",
            startTime: entry.startTime || "",
            endTime: entry.endTime || "",
            memo: entry.memo || "",
            images: entry.images || [],
          });
        });
      });
    } catch (e) {}

    try {
      const album = JSON.parse(localStorage.getItem("albumLogs") || "{}");
      Object.entries(album).forEach(([dk, arr]) => {
        arr.forEach((entry, idx) => {
          if (!newEvents[dk]) newEvents[dk] = [];
          newEvents[dk].push({
            id: `album_${dk}_${idx}`,
            type: "album",
            title: entry.title || "",
            memo: entry.comment || "",
            images: entry.images || [],
          });
        });
      });
    } catch (e) {}

    try {
      const musicAll = JSON.parse(localStorage.getItem("musicLogs") || '{"original":[],"cover":[]}');
      ["original", "cover"].forEach((cat) => {
        const arr = musicAll[cat] || [];
        arr.forEach((entry, idx) => {
          const dk = entry.date || dateKey(new Date());
          if (!newEvents[dk]) newEvents[dk] = [];
          newEvents[dk].push({
            id: `music_${cat}_${dk}_${idx}`,
            type: "music",
            subtype: cat,
            title: entry.title || "",
            memo: entry.memo || "",
            url: entry.url || "",
            thumbnail: entry.thumbnail || null,
          });
        });
      });
    } catch (e) {}

    // 🎂 毎年3/10の固定イベントを追加
    const withFixed = addFixedEvents(newEvents);

    setEvents(withFixed);
    localStorage.setItem("events_v1", JSON.stringify(withFixed));
  };

  useEffect(() => {
    const saved = localStorage.getItem("events_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 🎂 読み込み時にも固定イベントを保証
        setEvents(addFixedEvents(parsed));
      } catch (e) {
        refreshFromStorages();
      }
    } else {
      refreshFromStorages();
    }
  }, []);

  const addEvent = (date, ev) => {
    const key = dateKey(date);
    setEvents((prev) => {
      const arr = prev[key] ? [...prev[key]] : [];
      const id = ev.id || `${ev.type}_${key}_${Date.now()}`;
      const withId = { ...ev, id };
      const next = { ...prev, [key]: [...arr, withId] };
      localStorage.setItem("events_v1", JSON.stringify(next));
      return addFixedEvents(next); // 🎂 毎回保証
    });
  };

  const updateEvent = (date, id, data) => {
    const key = dateKey(date);
    setEvents((prev) => {
      const arr = (prev[key] || []).map((e) => (e.id === id ? { ...e, ...data } : e));
      const next = { ...prev, [key]: arr };
      localStorage.setItem("events_v1", JSON.stringify(next));
      return addFixedEvents(next);
    });
  };

  const deleteEvent = (date, id) => {
    const key = dateKey(date);
    setEvents((prev) => {
      const arr = (prev[key] || []).filter((e) => e.id !== id);
      const copy = { ...prev };
      if (arr.length === 0) delete copy[key];
      else copy[key] = arr;
      localStorage.setItem("events_v1", JSON.stringify(copy));
      return addFixedEvents(copy);
    });
  };

  const getEventsByDate = (date) => {
    const key = dateKey(date);
    return events[key] || [];
  };

  return (
    <EventContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsByDate,
        refreshFromStorages,
        dateKey,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used inside EventProvider");
  return ctx;
};

export default EventContext;

