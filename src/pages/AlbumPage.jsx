// src/pages/AlbumPage.jsx
import React, { useState, useEffect } from "react";
import localforage from "localforage";
import { useEvents } from "../context/EventContext";
import BackButton from '../components/BackButton';

const AlbumPage = () => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]); // stores image keys (strings)
  const [previews, setPreviews] = useState({}); // key -> objectURL for preview
  const [savedAlbums, setSavedAlbums] = useState({});
  const [message, setMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const { refreshFromStorages } = useEvents();

  // load saved albums
  useEffect(() => {
    const load = async () => {
      const stored = (await localforage.getItem("albumLogs")) || {};
      setSavedAlbums(stored);

      // prefetch previews for stored images
      const map = {};
      for (const arr of Object.values(stored)) {
        for (const entry of arr) {
          if (Array.isArray(entry.images)) {
            for (const key of entry.images) {
              if (!map[key]) {
                const blob = await localforage.getItem(key);
                if (blob instanceof Blob) map[key] = URL.createObjectURL(blob);
                else if (typeof blob === "string") map[key] = blob;
              }
            }
          }
        }
      }
      setPreviews(map);
    };
    load();
  }, []);

  // reset form
  const resetForm = () => {
    setDate("");
    setTitle("");
    setComment("");
    setImages([]);
    setEditIndex(null);
  };

  // when user selects files, store blobs in localforage immediately and save keys
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const newKeys = [];
    const newPreviews = { ...previews };
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = `albumimg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      try {
        await localforage.setItem(key, file); // store Blob / File
        newKeys.push(key);
        newPreviews[key] = URL.createObjectURL(file);
      } catch (err) {
        console.error("store image err", err);
      }
    }
    setImages((prev) => [...prev, ...newKeys]);
    setPreviews(newPreviews);
  };

  // save album (images contains keys)
  const handleSave = async () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }
    const newAlbum = { title, comment, images: images.slice() };
    const stored = (await localforage.getItem("albumLogs")) || {};
    const arr = stored[date] ? [...stored[date]] : [];
    if (editIndex !== null) {
      arr[editIndex] = newAlbum;
    } else {
      arr.push(newAlbum);
    }
    const updated = { ...stored, [date]: arr };
    await localforage.setItem("albumLogs", updated);
    setSavedAlbums(updated);
    try { await refreshFromStorages(); } catch(e){}
    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleEdit = (dateKey, index) => {
  const album = savedAlbums[dateKey][index];
  setDate(dateKey);
  setTitle(album.title);
  setComment(album.comment);
  setImages(album.images || []);
  setEditIndex(index);

  // 🔽 編集開始時に previews も再構築
  const newPreviews = {};
  (album.images || []).forEach((key) => {
    if (previews[key]) {
      newPreviews[key] = previews[key]; // 既存のURLを流用
    }
  });
  setPreviews(newPreviews);
};

  const handleDeleteAlbum = async (dateKey, index) => {
    const updated = { ...savedAlbums };
    const entry = updated[dateKey][index];
    // remove related blobs from storage
    if (entry?.images) {
      for (const k of entry.images) {
        try { await localforage.removeItem(k); } catch(e){/*ignore*/ }
      }
    }
    updated[dateKey].splice(index, 1);
    if (updated[dateKey].length === 0) delete updated[dateKey];
    await localforage.setItem("albumLogs", updated);
    setSavedAlbums(updated);
    try { await refreshFromStorages(); } catch(e){}
  };

  // delete a single image from a saved album
  const handleDeleteImageInAlbum = async (dateKey, albumIndex, imageKey) => {
    const updated = { ...savedAlbums };
    const album = updated[dateKey][albumIndex];
    album.images = album.images.filter((k) => k !== imageKey);
    // remove blob from storage
    try { await localforage.removeItem(imageKey); } catch(e){}
    await localforage.setItem("albumLogs", updated);
    // update previews
    setPreviews((p) => {
      const copy = { ...p };
      if (copy[imageKey]) {
        URL.revokeObjectURL(copy[imageKey]);
        delete copy[imageKey];
      }
      return copy;
    });
    setSavedAlbums(updated);
    try { await refreshFromStorages(); } catch(e){}
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">📷 推し活アルバム</h1>

      {/* 入力フォーム */}
      <div className="bg-white shadow-md rounded-xl p-4 max-w-md mx-auto">
        <input type="date" className="w-full border rounded p-2 mb-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="text" placeholder="タイトル (例: ライブ・誕生日記念)" className="w-full border rounded p-2 mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="コメント／思い出の記録" className="w-full border rounded p-2 mb-2" value={comment} onChange={(e) => setComment(e.target.value)} />
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-2" />
        <div className="flex flex-wrap gap-2 mb-2">
         {images.map((key, idx) => (
          <div key={key} className="relative">
           <img
            src={previews[key]}
            alt="preview"
            className="w-20 h-20 object-cover rounded"
           />
           <button
            type="button"
            onClick={() => {
             setImages(images.filter((_, i) => i !== idx));
             const newPreviews = { ...previews };
             delete newPreviews[key];
             setPreviews(newPreviews);
            }}
           className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
          >
           ✕
          </button>
         </div>
       ))}
      </div>
        <button onClick={handleSave} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
          {editIndex !== null ? "更新する" : "保存する"}
        </button>
        {message && <p className="text-center mt-2 text-green-600">{message}</p>}
      </div>

      {/* 保存済みデータ一覧 */}
      <div className="mt-6 max-w-4xl mx-auto">
        {Object.keys(savedAlbums).length === 0 ? (
          <p className="text-center text-gray-500">まだアルバムはありません。</p>
        ) : (
          Object.entries(savedAlbums).map(([dateKey, albums]) => (
            <div key={dateKey} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">📅 {dateKey}</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {albums.map((album, index) => (
                  <div key={index} className="bg-white shadow-md rounded-xl overflow-hidden">
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-1">{album.title}</h3>
                      <p className="text-gray-700 flex-grow">{album.comment}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {album.images &&
                          album.images.map((imgKey, idx) => (
                            <div key={imgKey} className="relative">
                              <img src={previews[imgKey]} alt="saved" className="w-16 h-16 object-cover rounded" />
                              <button
                                onClick={() => handleDeleteImageInAlbum(dateKey, index, imgKey)}
                                className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded px-1"
                                title="この写真を削除"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => handleEdit(dateKey, index)} className="px-3 py-1 bg-blue-400 text-white rounded">
                          編集
                        </button>
                        <button onClick={() => handleDeleteAlbum(dateKey, index)} className="px-3 py-1 bg-red-400 text-white rounded">
                          削除
                        </button>
                      </div>
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

export default AlbumPage;

