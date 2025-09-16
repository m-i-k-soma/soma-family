import React, { createContext, useContext, useState } from "react";

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [events, setEvents] = useState({});

  const addEvent = (date, event) => {
    setEvents((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), event],
    }));
  };

  const getEventsByDate = (date) => {
    return events[date] || [];
  };

  return (
    <ScheduleContext.Provider value={{ events, addEvent, getEventsByDate,addStreamLog,getStreamLogsByDate, }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);
// 追加：配信記録を保存
const addStreamLog = (date, log) => {
  setEvents((prev) => {
    const updated = {
      ...prev,
      [date]: [...(prev[date] || []), { ...log, type: "stream" }],
    };
    localStorage.setItem("events", JSON.stringify(updated));
    return updated;
  });
};

// 追加：その日付の配信ログを取得
const getStreamLogsByDate = (date) => {
  return (events[date] || []).filter((item) => item.type === "stream");
};

