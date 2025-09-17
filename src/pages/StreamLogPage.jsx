// src/pages/StreamLogPage.jsx
import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { useEvents } from "../context/EventContext";
import BackButton from '../components/BackButton';

const StreamLogPage = () => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [memo, setMemo] = useState("");
  const [imageKeys, setImageKeys] = useState([]); // keys stored in localforage
  const [previews, setPreviews] = useState({}); // key -> objectURL
  const [savedLogs, setSavedLogs] = useState({});
  const [message, setMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const { refreshFromStorages } = useEvents();

  // load saved logs + previews
  useEffect(() => {
    const load = async () => {
      const stored = (await localforage.getItem("streamLogs")) || {};
      setSavedLogs(stored);

      const map = {};
      for (const arr of Object.values(stored)) {
        for (const entry of arr) {
          if (Array.isArray(entry.images)) {
            for (const k of entry.images) {
              if (!map[k]) {
                const blob = await localforage.getItem(k);
                if (blob instanceof Blob) map[k] = URL.createObjectURL(blob);
                else if (typeof blob === "string") map[k] = blob;
              }
            }
          }
        }
      }
      setPreviews(map);
    };
    load();
  }, []);

  const resetForm = () => {
    setDate("");
    setTitle("");
    setStartTime("");
    setEndTime("");
    setMemo("");
    setImageKeys([]);
    setEditIndex(null);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const newKeys = [];
    const newPreviews = { ...previews };
    for (const file of files) {
      const key = `streamimg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      try {
        await localforage.setItem(key, file);
        newKeys.push(key);
        newPreviews[key] = URL.createObjectURL(file);
      } catch (err) {
        console.error("store stream image err", err);
      }
    }
    setImageKeys((p) => [...p, ...newKeys]);
    setPreviews(newPreviews);
  };

  const handleSave = async () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }
    const newLog = { title, startTime, endTime, memo, images: [...imageKeys] };
    const stored = (await localforage.getItem("streamLogs")) || {};
    const arr = stored[date] ? [...stored[date]] : [];
    if (editIndex !== null) {
      arr[editIndex] = newLog;
    } else {
      arr.push(newLog);
    }
    const updated = { ...stored, [date]: arr };
    await localforage.setItem("streamLogs", updated);
    setSavedLogs(updated);
    try { await refreshFromStorages(); } catch(e) { console.error(e); }
    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleEdit = (dateKey, index) => {
    const log = savedLogs[dateKey][index];
    setDate(dateKey);
    setTitle(log.title);
    setStartTime(log.startTime);
    setEndTime(log.endTime);
    setMemo(log.memo);
    setImageKeys(log.images || []);
    setEditIndex(index);

    // rebuild previews for this edit session
    const newPreviews = {};
    (log.images || []).forEach((k) => {
      if (previews[k]) newPreviews[k] = previews[k];
    });
    setPreviews((p) => ({ ...p, ...newPreviews }));
  };

  const handleDelete = async (dateKey, index) => {
    const updated = { ...savedLogs };
    const entry = updated[dateKey][index];
    // remove related blobs
    if (entry?.images) {
      for (const k of entry.images) {
        try { await localforage.removeItem(k); } catch(e) {}
      }
    }
    updated[dateKey].splice(index, 1);
    if (updated[dateKey].length === 0) delete updated[dateKey];
    await localforage.setItem("streamLogs", updated);
    setSavedLogs(updated);
    try { await refreshFromStorages(); } catch(e) {}
    // cleanup previews
    setPreviews((p) => {
      const copy = { ...p };
      if (entry?.images) {
        for (const k of entry.images) {
          if (copy[k]) { URL.revokeObjectURL(copy[k]); delete copy[k]; }
        }
      }
      return copy;
    });
  };

  // delete single image in edit form
  const handleDeleteImageInEdit = async (key) => {
    // remove from current editing keys, and remove stored blob if it exists in storage
    setImageKeys((arr) => arr.filter((k) => k !== key));
    try { await localforage.removeItem(key); } catch(e) {}
    setPreviews((p) => {
      const copy = { ...p };
      if (copy[key]) { URL.revokeObjectURL(copy[key]); delete copy[key]; }
      return copy;
    });
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🎤 配信記録</h1>

      {/* 入力フォーム */}
      <div className="bg-white shadow-md rounded-xl p-4 max-w-md mx-auto">
        <input type="date" className="w-full border rounded p-2 mb-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="text" placeholder="配信タイトル" className="w-full border rounded p-2 mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2 mb-2">
          <input type="time" className="w-1/2 border rounded p-2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="time" className="w-1/2 border rounded p-2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <textarea placeholder="メモ・感想" className="w-full border rounded p-2 mb-2" value={memo} onChange={(e) => setMemo(e.target.value)} />
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-2" />

        {/* 編集画面の画像表示＆削除 */}
        <div className="flex gap-2 flex-wrap mb-2">
          {imageKeys.map((key, i) => (
            <div key={key} className="relative">
              <img src={previews[key]} alt="img" className="w-20 h-20 object-cover rounded" />
              <button type="button" onClick={() => handleDeleteImageInEdit(key)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">✕</button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
          {editIndex !== null ? "更新する" : "保存する"}
        </button>
        {message && <p className="text-center mt-2 text-green-600">{message}</p>}
      </div>

      {/* 保存済みデータ一覧 */}
      <div className="mt-6 max-w-2xl mx-auto">
        {Object.keys(savedLogs).length === 0 ? (
          <p className="text-center text-gray-500">保存された記録はありません。</p>
        ) : (
          Object.entries(savedLogs).map(([dateKey, logs]) => (
            <div key={dateKey} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">📅 {dateKey}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {logs.map((log, index) => (
                  <div key={index} className="bg-white shadow-md rounded-xl p-4 flex flex-col">
                    <h3 className="font-bold text-lg mb-1">{log.title}</h3>
                    <p className="text-sm text-gray-600">{log.startTime} - {log.endTime}</p>
                    <p className="mt-2 text-gray-700">{log.memo}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {log.images?.map((k, idx) => (
                        <img key={k} src={previews[k]} alt="saved" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => handleEdit(dateKey, index)} className="px-3 py-1 bg-blue-400 text-white rounded">編集</button>
                      <button onClick={() => handleDelete(dateKey, index)} className="px-3 py-1 bg-red-400 text-white rounded">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BackButton />
    </div>
  );
};

export default StreamLogPage;

