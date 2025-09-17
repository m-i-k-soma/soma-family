// src/components/MonthCalendar.jsx
import React, { useState } from "react";
import dayjs from "dayjs";

const MonthCalendar = ({ onDateClick, events = [], small }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");

  const days = [];
  let date = startDate;
  while (date.isBefore(endDate) || date.isSame(endDate, "day")) {
    days.push(date);
    date = date.add(1, "day");
  }

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">◀</button>
        <h2 className="text-xl font-bold font-sans">{currentMonth.format("YYYY / MM")}</h2>
        <button onClick={handleNextMonth} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">▶</button>
      </div>

      <div className="grid grid-cols-7 text-center font-semibold mb-2 font-sans">
        <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = day.format("YYYY-MM-DD");
          // events is array of { date, type, ... }
          const dayEvents = events.filter((ev) => ev.date === dateKey);

          return (
            <div
              key={dateKey}
              onClick={() => onDateClick && onDateClick(dateKey)}
              className={`cursor-pointer p-2 h-24 border rounded-lg flex flex-col items-center justify-start hover:bg-yellow-100 transition
                ${day.month() !== currentMonth.month() ? "bg-gray-100" : "bg-white"}
              `}
            >
              <div className="font-bold">{day.date()}</div>
              <div className="flex flex-wrap justify-center">
                {dayEvents.map((ev, i) => (
                  <span key={i} className="text-xl">
                    {ev.type === "stream" ? "🎤" : ev.type === "album" ? "📷" : ev.type === "music" ? "🎵" : "📌"}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;

