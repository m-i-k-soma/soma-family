// src/components/MonthCalendar.jsx
import React, { useMemo, useState } from "react";
import { useEvents } from "../context/EventContext";

/**
 * Props:
 *  - onDateClick(dateKey)  // optional
 *  - small: boolean (if true, compact layout)
 */

const ICONS = {
  stream: "🎤",
  album: "📷",
  music: "🎵",
  schedule: "📅",
};

const WeekDays = ["日", "月", "火", "水", "木", "金", "土"];

const MonthCalendar = ({ onDateClick, small = false }) => {
  const { events, getEventsByDate, dateKey } = useEvents();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // compute cells (6 rows x 7 cols = 42)
  const startDay = new Date(year, month, 1).getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        arr.push(null);
      } else {
        const d = new Date(year, month, dayNum);
        const key = dateKey(d);
        const evs = getEventsByDate(key);
        arr.push({ date: d, key, events: evs });
      }
    }
    return arr;
  }, [year, month, events]); // depends on events so it re-renders when central data changes

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const handleDateClick = (cell) => {
    if (!cell) return;
    if (onDateClick) onDateClick(cell.key);
  };

  return (
    <div className={`${small ? "calendar-small" : "calendar-large"} w-full`}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="px-3 py-1 rounded bg-white shadow-sm">
          ◀
        </button>
        <div className="text-lg font-semibold">
          {year} / {String(month + 1).padStart(2, "0")}
        </div>
        <button onClick={nextMonth} className="px-3 py-1 rounded bg-white shadow-sm">
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WeekDays.map((w) => (
          <div key={w} className="text-center font-medium text-sm py-1">
            {w}
          </div>
        ))}

        {cells.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => cell && handleDateClick(cell)}
            className={`min-h-[54px] flex flex-col items-start p-2 border rounded-sm ${
              cell ? "bg-white" : "bg-transparent"
            }`}
          >
            {cell ? (
              <>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm font-medium">{cell.date.getDate()}</div>
                </div>

                <div className="mt-1 text-sm">
                  {/* show unique types as icons */}
                  {Array.from(new Set((cell.events || []).map((e) => e.type))).map(
                    (t, i) => (
                      <span key={i} className="mr-1">
                        {ICONS[t] || "📌"}
                      </span>
                    )
                  )}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthCalendar;

