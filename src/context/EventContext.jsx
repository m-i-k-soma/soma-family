import React, { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";

const EventContext = createContext();
export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  // 各ストレージから集約
  const refreshFromStorages = async () => {
    let allEvents = [];

    // --- Album ---
    const album = await localforage.getItem("album");
    if (album) {
      album.forEach((item) => {
        allEvents.push({
          date: item.date,
          title: item.caption || "アルバム",
          type: "album",
          images: [item.image], // 単枚
        });
      });
    }

    // --- StreamLog ---
    const streamLogs = await localforage.getItem("streamLogs");
    if (streamLogs) {
      Object.entries(streamLogs).forEach(([date, logs]) => {
        logs.forEach((log) => {
          allEvents.push({
            date,
            title: log.title,
            type: "stream",
            images: log.images || [],
          });
        });
      });
    }

    // --- Music ---
    const musicLogs = await localforage.getItem("musicLogs");
    if (musicLogs) {
      ["original", "cover"].forEach((category) => {
        (musicLogs[category] || []).forEach((entry) => {
          allEvents.push({
            date: entry.date,
            title: entry.title,
            type: "music",
            images: entry.thumbnail ? [entry.thumbnail] : [],
          });
        });
      });
    }

    setEvents(allEvents);
  };

  useEffect(() => {
    refreshFromStorages();
  }, []);

  return (
    <EventContext.Provider value={{ events, refreshFromStorages }}>
      {children}
    </EventContext.Provider>
  );
};

