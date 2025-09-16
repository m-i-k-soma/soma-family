import React, { useState, useEffect } from "react";
import { useEvents } from "../context/EventContext";
import BackButton from '../components/BackButton';
import localforage from "localforage";

const StreamLogPage = () => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [memo, setMemo] = useState("");
  const [images, setImages] = useState([]);
  const [savedLogs, setSavedLogs] = useState({});
  const [message, setMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const { refreshFromStorages } = useEvents();

  // 保存データの読み込み
  useEffect(() => {
    (async () => {
      const storedLogs = await localforage.getItem("streamLogs");
      if (storedLogs) setSavedLogs(storedLogs);
    })();
  }, []);

  // フォームリセット
  const resetForm = () => {
    setDate("");
    setTitle("");
    setStartTime("");
    setEndTime("");
    setMemo("");
    setImages([]);
    setEditIndex(null);
  };

  // 保存処理
  const handleSave = async () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }

    const newLog = { title, startTime, endTime, memo, images };
    let updatedLogs = { ...savedLogs };

    if (editIndex !== null) {
      if (!updatedLogs[date]) updatedLogs[date] = [];
      updatedLogs[date][editIndex] = newLog;
    } else {
      updatedLogs = {
        ...updatedLogs,
        [date]: [...(updatedLogs[date] || []), newLog],
      };
    }

    setSavedLogs(updatedLogs);
    await localforage.setItem("streamLogs", updatedLogs);

    try {
      refreshFromStorages();
    } catch (e) {
      console.error("refreshFromStorages error:", e);
    }

    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();
    setTimeout(() => setMessage(""), 2000);
  };

  // 編集処理
  const handleEdit = (dateKey, index) => {
    const log = savedLogs[dateKey][index];
    setDate(dateKey);
    setTitle(log.title);
    setStartTime(log.startTime);
    setEndTime(log.endTime);
    setMemo(log.memo);
    setImages(log.images || []);
    setEditIndex(index);
  };

  // 削除処理
  const handleDelete = async (dateKey, index) => {
    const updatedLogs = { ...savedLogs };
    updatedLogs[dateKey].splice(index, 1);
    if (updatedLogs[dateKey].length === 0) delete updatedLogs[dateKey];
    setSavedLogs(updatedLogs);
    await localforage.setItem("streamLogs", updatedLogs);
    try {
      refreshFromStorages();
    } catch (e) {}
  };

  // 画像アップロード処理
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
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
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <img key={idx} src={img} alt="preview" className="w-20 h-20 object-cover rounded" />
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
                      {log.images && log.images.map((img, idx) => (
                        <img key={idx} src={img} alt="saved" className="w-16 h-16 object-cover rounded" />
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

