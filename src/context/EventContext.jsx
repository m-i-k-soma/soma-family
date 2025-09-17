// src/context/EventContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const EventContext = createContext();

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

const blobKeyToObjectUrl = async (key) => {
  if (!key) return null;
  try {
    const blob = await localforage.getItem(key);
    if (!blob) return null;
    if (blob instanceof Blob) {
      return URL.createObjectURL(blob);
    }
    if (typeof blob === "string" && (blob.startsWith("data:") || blob.startsWith("blob:") || blob.startsWith("http"))) {
      return blob;
    }
    return null;
  } catch (e) {
    console.error("blobKeyToObjectUrl error:", e);
    return null;
  }
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({});

  const addFixedEvents = (eventsObj) => {
    const years = [];
    for (let y = 2024; y <= 2100; y++) years.push(y);
    years.forEach((y) => {
      const key = `${y}-03-10`;
      if (!eventsObj[key]) eventsObj[key] = [];
      const exists = eventsObj[key].some((ev) => ev.id?.startsWith("birthday_"));
      if (!exists) {
        eventsObj[key].push({
          id: `birthday_${y}`,
          type: "schedule",
          title: "生誕・周年記念🎂",
          date: key,
        });
      }
    });
    return eventsObj;
  };

  const refreshFromStorages = async () => {
    const newEvents = {};

    // 1) streamLogs
    try {
      const stream = (await localforage.getItem("streamLogs")) || {};
      for (const [dk, arr] of Object.entries(stream)) {
        for (let idx = 0; idx < arr.length; idx++) {
          const entry = arr[idx];
          if (!newEvents[dk]) newEvents[dk] = [];
          const images = [];
          if (Array.isArray(entry.images)) {
            for (const k of entry.images) {
              const url = await blobKeyToObjectUrl(k);
              if (url) images.push(url);
            }
          }
          newEvents[dk].push({
            id: `stream_${dk}_${idx}`,
            type: "stream",
            title: entry.title || "",
            startTime: entry.startTime || "",
            endTime: entry.endTime || "",
            memo: entry.memo || "",
            images,
            date: dk,
          });
        }
      }
    } catch (e) {
      console.error("refresh stream error", e);
    }

    // 2) albumLogs
    try {
      const album = (await localforage.getItem("albumLogs")) || {};
      for (const [dk, arr] of Object.entries(album)) {
        for (let idx = 0; idx < arr.length; idx++) {
          const entry = arr[idx];
          if (!newEvents[dk]) newEvents[dk] = [];
          const images = [];
          if (Array.isArray(entry.images)) {
            for (const k of entry.images) {
              const url = await blobKeyToObjectUrl(k);
              if (url) images.push(url);
            }
          }
          newEvents[dk].push({
            id: `album_${dk}_${idx}`,
            type: "album",
            title: entry.title || "",
            memo: entry.comment || "",
            images,
            date: dk,
          });
        }
      }
    } catch (e) {
      console.error("refresh album error", e);
    }

    // 3) musicLogs
    try {
      console.log("musicLogsの読み込み開始");
      const musicAll = (await localforage.getItem("musicLogs")) || { original: [], cover: [] };
      console.log("読み込まれたmusicLogs:", musicAll);
      for (const cat of ["original", "cover"]) {
        const arr = musicAll[cat] || [];
        for (let idx = 0; idx < arr.length; idx++) {
          const entry = arr[idx];
          const dk = entry.date || dateKey(new Date());
          if (!newEvents[dk]) newEvents[dk] = [];
          let thumbnail = null;
          if (entry.thumbnail) {
            thumbnail = await blobKeyToObjectUrl(entry.thumbnail);
          }
          newEvents[dk].push({
            id: `music_${cat}_${dk}_${idx}`,
            type: "music",
            subtype: cat,
            title: entry.title || "",
            memo: entry.memo || "",
            url: entry.url || "",
            thumbnail,
            date: dk,
          });
        }
      }
    } catch (e) {
      console.error("refresh music error", e);
    }

    const withFixed = addFixedEvents(newEvents);
    setEvents(withFixed);
    try {
      await localforage.setItem("events_v1", withFixed);
    } catch (e) {}
  };

  useEffect(() => {
    const init = async () => {
      await refreshFromStorages();
      try {
        const cached = (await localforage.getItem("events_v1")) || null;
        if (cached) {
          setEvents(addFixedEvents(cached));
        }
      } catch (e) {}
      
    };
    init();
    // eslint-disable-next-line
  }, []);

  const addEvent = (date, ev) => {
    const key = dateKey(date);
    setEvents((prev) => {
      const arr = prev[key] ? [...prev[key]] : [];
      const id = ev.id || `${ev.type}_${key}_${Date.now()}`;
      const withId = { ...ev, id, date: key };
      const next = { ...prev, [key]: [...arr, withId] };
      localforage.setItem("events_v1", next).catch(() => {});
      return addFixedEvents(next);
    });
  };

  const updateEvent = (date, id, data) => {
    const key = dateKey(date);
    setEvents((prev) => {
      const arr = (prev[key] || []).map((e) => (e.id === id ? { ...e, ...data } : e));
      const next = { ...prev, [key]: arr };
      localforage.setItem("events_v1", next).catch(() => {});
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
      localforage.setItem("events_v1", copy).catch(() => {});
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

