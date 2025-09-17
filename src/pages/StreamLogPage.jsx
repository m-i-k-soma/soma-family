import React, { useState, useEffect } from "react";
import localforage from "localforage";

const StreamLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    localforage.getItem("streamLogs").then((data) => {
      if (data) setLogs(data);
    });
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]); // base64で保存
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!title || !date) return;
    const newLog = {
      title,
      date,
      images,
      type: "stream",
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    await localforage.setItem("streamLogs", updated);
    setTitle("");
    setDate("");
    setImages([]);
  };

  const handleDelete = async (index) => {
    const updated = logs.filter((_, i) => i !== index);
    setLogs(updated);
    await localforage.setItem("streamLogs", updated);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">配信記録</h1>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="border p-2 rounded w-full"
      />

      {/* 編集画面の画像表示＆削除 */}
      <div className="flex gap-2 flex-wrap">
        {images.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt="upload" className="w-20 h-20 object-cover rounded" />
            <button
              type="button"
              onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        保存
      </button>

      <ul className="space-y-2">
        {logs.map((log, i) => (
          <li key={i} className="border p-2 rounded">
            <p>{log.date} - {log.title}</p>
            <div className="flex gap-2 flex-wrap">
              {log.images.map((src, j) => (
                <img key={j} src={src} alt="log" className="w-16 h-16 object-cover rounded" />
              ))}
            </div>
            <button
              onClick={() => handleDelete(i)}
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StreamLogPage;

