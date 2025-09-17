// src/pages/MusicPage.jsx
import React, { useState, useEffect } from "react";
import { useEvents } from "../context/EventContext";
import BackButton from "../components/BackButton";
import localforage from "localforage";

const MusicPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null); // "original" or "cover"
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [musicLogs, setMusicLogs] = useState({ original: [], cover: [] });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState("");

  const { refreshFromStorages } = useEvents();

  const categoryLabel = {
    original: "オリジナル楽曲",
    cover: "歌ってみた",
  };

  useEffect(() => {
    const storedLogs = localStorage.getItem("musicLogs");
    if (storedLogs) {
      setMusicLogs(JSON.parse(storedLogs));
    }
  }, []);

  const resetForm =  () => {
    setDate("");
    setTitle("");
    setMemo("");
    setUrl("");
    setThumbnail(null);
    setEditIndex(null);
  };

  const handleSave = async () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }

    const newEntry = { date, title, memo, url, thumbnail };
    const updatedLogs = { ...musicLogs };

    if (editIndex !== null) {
      updatedLogs[selectedCategory][editIndex] = newEntry;
    } else {
      updatedLogs[selectedCategory] = [
        ...updatedLogs[selectedCategory],
        newEntry,
      ];
    }

    setMusicLogs(updatedLogs);
    console.log("保存されたmusicLogs:", updatedLogs);

    localStorage.setItem("musicLogs", JSON.stringify(updatedLogs));

    try {
      await refreshFromStorages();
    } catch (e) {}

    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();

    setTimeout(() => setMessage(""), 2000);
  };
  
  const handleEdit = (index) => {
    const entry = musicLogs[selectedCategory][index];
    setDate(entry.date);
    setTitle(entry.title);
    setMemo(entry.memo);
    setUrl(entry.url);
    setThumbnail(entry.thumbnail);
    setEditIndex(index);
  };

  const handleDelete = async (indexToDelete = editIndex) => {
    if (indexToDelete === null) return;

    const updatedLogs = { ...musicLogs };
    updatedLogs[selectedCategory].splice(indexToDelete, 1);
    setMusicLogs(updatedLogs);

    await localforage.setItem("musicLogs", updatedLogs);

    try {
      refreshFromStorages();
    } catch (e) {}

    resetForm();
    setMessage("削除しました！");
    setTimeout(() => setMessage(""), 2000);
  };

  // Base64に変換して保存
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result); // base64文字列を保存
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🎵 楽曲集</h1>

      {!selectedCategory ? (
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => setSelectedCategory("original")}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl shadow-md"
          >
            オリジナル楽曲
          </button>
          <button
            onClick={() => setSelectedCategory("cover")}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl shadow-md"
          >
            歌ってみた
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">
            {categoryLabel[selectedCategory]}
          </h2>

          {/* 編集・追加フォーム */}
          <div className="bg-white shadow-md rounded-xl p-4 max-w-md mx-auto">
            <input
              type="date"
              className="w-full border rounded p-2 mb-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="タイトル"
              className="w-full border rounded p-2 mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="メモ"
              className="w-full border rounded p-2 mb-2"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
            <input
              type="text"
              placeholder="URLを入力"
              className="w-full border rounded p-2 mb-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="mb-2"
            />
            {thumbnail && (
              <div className="relative mb-2 inline-block">
               <img
                src={thumbnail}
                alt="thumbnail preview"
                className="w-24 h-24 object-cover rounded mb-2"
              />
              <button
                type="button"
                onClick={() => setThumbnail(null)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                title="画像を削除"
              >
               ✕
              </button>
            </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
              >
                {editIndex !== null ? "更新する" : "保存する"}
              </button>
              {editIndex !== null && (
                <button
                  onClick={() => handleDelete()}
                  className="flex-1 bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                  削除する
                </button>
              )}
            </div>

            {message && (
              <p className="text-center mt-2 text-green-600">{message}</p>
            )}
          </div>

          {/* 一覧表示 */}
          <div className="mt-6 max-w-4xl mx-auto">
            {musicLogs[selectedCategory].length === 0 ? (
              <p className="text-center text-gray-500">
                まだ登録がありません。
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {musicLogs[selectedCategory].map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-1">{entry.title}</h3>
                      <p className="text-gray-500 text-sm mb-1">
                        📅 {entry.date}
                      </p>
                      <p className="text-gray-700 flex-grow">{entry.memo}</p>
                      {entry.thumbnail && (
                        <img
                          src={entry.thumbnail}
                          alt="thumbnail"
                          className="w-full h-32 object-cover rounded mt-2"
                        />
                      )}
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline mt-2"
                        >
                          ▶ 楽曲リンク
                        </a>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1 bg-blue-400 text-white rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-1 bg-red-400 text-white rounded"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                resetForm();
                setSelectedCategory(null);
              }}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
            >
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

