// src/pages/MusicPage.jsx
import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { useEvents } from "../context/EventContext";
import BackButton from '../components/BackButton';

const MusicPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null); // "original" or "cover"
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailKey, setThumbnailKey] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [musicLogs, setMusicLogs] = useState({ original: [], cover: [] });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState("");

  const { refreshFromStorages } = useEvents();

  useEffect(() => {
    const load = async () => {
      const stored = (await localforage.getItem("musicLogs")) || { original: [], cover: [] };
      setMusicLogs(stored);

      // load thumbnails previews
      for (const cat of ["original", "cover"]) {
        for (const entry of stored[cat]) {
          if (entry.thumbnail) {
            const blob = await localforage.getItem(entry.thumbnail);
            if (blob instanceof Blob) {
              // create object URL and attach to entry (temporary)
              entry._thumbnailPreview = URL.createObjectURL(blob);
            } else if (typeof blob === "string") {
              entry._thumbnailPreview = blob;
            }
          }
        }
      }
      setMusicLogs({ ...stored });
    };
    load();
  }, []);

  const resetForm = () => {
    setDate("");
    setTitle("");
    setMemo("");
    setUrl("");
    setThumbnailKey(null);
    setThumbnailPreview(null);
    setEditIndex(null);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const key = `musthumb_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    try {
      await localforage.setItem(key, file);
      setThumbnailKey(key);
      setThumbnailPreview(URL.createObjectURL(file));
    } catch (e) {
      console.error("save thumb err", e);
    }
  };

  const handleSave = async () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }
    const newEntry = { date, title, memo, url, thumbnail: thumbnailKey || null };
    const stored = (await localforage.getItem("musicLogs")) || { original: [], cover: [] };
    const arr = stored[selectedCategory] ? [...stored[selectedCategory]] : [];
    if (editIndex !== null) {
      arr[editIndex] = newEntry;
    } else {
      arr.push(newEntry);
    }
    stored[selectedCategory] = arr;
    await localforage.setItem("musicLogs", stored);
    setMusicLogs(stored);
    try { await refreshFromStorages(); } catch(e){}
    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleEdit = (index) => {
    const entry = musicLogs[selectedCategory][index];
    setDate(entry.date || "");
    setTitle(entry.title || "");
    setMemo(entry.memo || "");
    setUrl(entry.url || "");
    setThumbnailKey(entry.thumbnail || null);
    setThumbnailPreview(entry._thumbnailPreview || null);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const stored = { ...musicLogs };
    const entry = stored[selectedCategory][index];
    if (entry?.thumbnail) {
      try { await localforage.removeItem(entry.thumbnail); } catch(e){}
    }
    stored[selectedCategory].splice(index, 1);
    await localforage.setItem("musicLogs", stored);
    setMusicLogs(stored);
    try { await refreshFromStorages(); } catch(e){}
  };

  const handleDeleteThumbnailInEntry = async (index) => {
    const stored = { ...musicLogs };
    const entry = stored[selectedCategory][index];
    if (!entry) return;
    if (entry.thumbnail) {
      try { await localforage.removeItem(entry.thumbnail); } catch(e){}
      entry.thumbnail = null;
      delete entry._thumbnailPreview;
      await localforage.setItem("musicLogs", stored);
      setMusicLogs(stored);
      try { await refreshFromStorages(); } catch(e){}
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🎵 楽曲集</h1>

      {!selectedCategory ? (
        <div className="flex justify-center gap-4 mt-10">
          <button onClick={() => setSelectedCategory("original")} className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl shadow-md">
            オリジナル楽曲
          </button>
          <button onClick={() => setSelectedCategory("cover")} className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl shadow-md">
            歌ってみた
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">{selectedCategory === "original" ? "オリジナル楽曲" : "歌ってみた"}</h2>

          <div className="bg-white shadow-md rounded-xl p-4 max-w-md mx-auto">
            <input type="date" className="w-full border rounded p-2 mb-2" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="text" placeholder="タイトル" className="w-full border rounded p-2 mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="メモ" className="w-full border rounded p-2 mb-2" value={memo} onChange={(e) => setMemo(e.target.value)} />
            <input type="text" placeholder="URLを入力" className="w-full border rounded p-2 mb-2" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="mb-2" />
            {thumbnailPreview && <img src={thumbnailPreview} alt="thumbnail preview" className="w-24 h-24 object-cover rounded mb-2" />}
            <button onClick={handleSave} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
              {editIndex !== null ? "更新する" : "保存する"}
            </button>
            {message && <p className="text-center mt-2 text-green-600">{message}</p>}
          </div>

          <div className="mt-6 max-w-4xl mx-auto">
            {musicLogs[selectedCategory].length === 0 ? (
              <p className="text-center text-gray-500">まだ登録がありません。</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {musicLogs[selectedCategory].map((entry, index) => (
                  <div key={index} className="bg-white shadow-md rounded-xl overflow-hidden">
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-1">{entry.title}</h3>
                      <p className="text-gray-500 text-sm mb-1">📅 {entry.date}</p>
                      <p className="text-gray-700 flex-grow">{entry.memo}</p>
                      {entry.thumbnail && (
                        <img src={entry._thumbnailPreview || ""} alt="thumbnail" className="w-full h-32 object-cover rounded mt-2" />
                      )}
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2">
                          ▶ 楽曲リンク
                        </a>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => handleEdit(index)} className="px-3 py-1 bg-blue-400 text-white rounded">編集</button>
                        <button onClick={() => handleDelete(index)} className="px-3 py-1 bg-red-400 text-white rounded">削除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={() => { resetForm(); setSelectedCategory(null); }} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded">
              ← 戻る
            </button>
          </div>
        </>
      )}

      <BackButton />
    </div>
  );
};

export default MusicPage;

