import React from "react";
import { useEvents } from "../context/EventContext";

const SchedulePage = () => {
  const { events } = useEvents();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">📅 スケジュール管理</h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">予定はまだありません。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {events.map((event, idx) => (
            <div key={idx} className="p-3 bg-white shadow rounded">
              <p className="font-bold">{event.title}</p>
              <p className="text-sm text-gray-500">{event.date}</p>
              {event.images && event.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {event.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="event"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

