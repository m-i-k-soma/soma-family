import React, { useState, useEffect } from "react";
import localforage from "localforage";

const MusicPage = () => {
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [date, setDate] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    localforage.getItem("musicList").then((data) => {
      if (data) setSongs(data);
    });
  }, []);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setThumbnail(reader.result); // base64保存
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title || !date) return;
    const newSong = {
      title,
      artist,
      date,
      thumbnail,
      type: "music",
    };
    const updated = [...songs, newSong];
    setSongs(updated);
    await localforage.setItem("musicList", updated);
    setTitle("");
    setArtist("");
    setDate("");
    setThumbnail("");
  };

  const handleDelete = async (index) => {
    const updated = songs.filter((_, i) => i !== index);
    setSongs(updated);
    await localforage.setItem("musicList", updated);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">楽曲集</h1>

      <input
        type="text"
        placeholder="曲名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        placeholder="アーティスト"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
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
        accept="image/*"
        onChange={handleThumbnailUpload}
        className="border p-2 rounded w-full"
      />

      {/* 編集画面のサムネイル表示＆削除 */}
      {thumbnail && (
        <div className="relative w-24">
          <img src={thumbnail} alt="thumb" className="w-24 h-24 object-cover rounded" />
          <button
            type="button"
            onClick={() => setThumbnail("")}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
          >
            ✕
          </button>
        </div>
      )}

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        保存
      </button>

      <ul className="space-y-2">
        {songs.map((song, i) => (
          <li key={i} className="border p-2 rounded">
            <p>{song.date} - {song.title} ({song.artist})</p>
            {song.thumbnail && (
              <img
                src={song.thumbnail}
                alt="thumb"
                className="w-16 h-16 object-cover rounded"
              />
            )}
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

export default MusicPage;

