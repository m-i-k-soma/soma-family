// src/pages/SchedulePage.jsx
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import MonthCalendar from "../components/MonthCalendar";
import { useEvents } from "../context/EventContext";
import BackButton from '../components/BackButton';

const SchedulePage = () => {
  const { getEventsByDate } = useEvents();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
  };

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4">📅 スケジュール管理</h1>

        <div className="bg-transparent p-2 flex justify-center">
          <div className="w-full">
            <MonthCalendar onDateClick={handleDateClick} small={false} />
          </div>
        </div>
      </div>

      {/* modal */}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">📅 {selectedDate} の予定</h2>
              <button onClick={() => setSelectedDate(null)} className="px-2 py-1 rounded bg-gray-200">
                閉じる
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-auto">
              {getEventsByDate(selectedDate).length === 0 ? (
                <p className="text-gray-500">予定はありません。</p>
              ) : (
                getEventsByDate(selectedDate).map((ev) => (
                  <div key={ev.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <div className="text-xl">
                          {ev.type === "stream" ? "🎤" : ev.type === "album" ? "📷" : ev.type === "music" ? "🎵" : "📌"}
                        </div>
                        <div className="font-bold">{ev.title || "(タイトルなし)"}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {ev.startTime ? `${ev.startTime}${ev.endTime ? " - " + ev.endTime : ""}` : ""}
                      </div>
                    </div>
                    {ev.memo && <div className="mt-2 text-sm text-gray-700">{ev.memo}</div>}
                    {ev.images && ev.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.images.map((src, i) => (
                          <img key={i} src={src} alt="img" className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {ev.url && (
                      <div className="mt-2">
                        <a href={ev.url} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                          ▶ リンクを開く
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
<BackButton />
export default SchedulePage;


