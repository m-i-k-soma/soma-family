import React, { useState, useEffect } from "react";
import { useEvents } from "../context/EventContext";
import BackButton from "../components/BackButton";

const AlbumPage = () => {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState({});
  const [message, setMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const { refreshFromStorages } = useEvents();

  // ローカルストレージからデータ読み込み
  useEffect(() => {
    const storedAlbums = localStorage.getItem("albumLogs");
    if (storedAlbums) {
      setSavedAlbums(JSON.parse(storedAlbums));
    }
  }, []);

  // 入力リセット
  const resetForm = () => {
    setDate("");
    setTitle("");
    setComment("");
    setImages([]);
    setEditIndex(null);
  };

  // 保存処理
  const handleSave = () => {
    if (!date || !title) {
      setMessage("日付とタイトルは必須です。");
      return;
    }

    const newAlbum = { title, comment, images };
    let updatedAlbums = { ...savedAlbums };

    if (editIndex !== null) {
      // 編集モード
      if (!updatedAlbums[date]) {
        updatedAlbums[date] = [];
      }
      updatedAlbums[date][editIndex] = newAlbum;
    } else {
      // 新規保存
      updatedAlbums = {
        ...updatedAlbums,
        [date]: [...(updatedAlbums[date] || []), newAlbum],
      };
    }

    setSavedAlbums(updatedAlbums);
    localStorage.setItem("albumLogs", JSON.stringify(updatedAlbums));

    try {
      refreshFromStorages();
    } catch (e) {}

    setMessage(editIndex !== null ? "更新しました！" : "保存しました！");
    resetForm();

    setTimeout(() => setMessage(""), 2000);
  };

  // 編集処理
  const handleEdit = (dateKey, index) => {
    const album = savedAlbums[dateKey][index];
    setDate(dateKey);
    setTitle(album.title);
    setComment(album.comment);
    setImages(album.images || []);
    setEditIndex(index);
  };

  // 削除処理
  const handleDelete = (dateKey, index) => {
    const updatedAlbums = { ...savedAlbums };
    updatedAlbums[dateKey].splice(index, 1);
    if (updatedAlbums[dateKey].length === 0) {
      delete updatedAlbums[dateKey];
    }
    setSavedAlbums(updatedAlbums);
    localStorage.setItem("albumLogs", JSON.stringify(updatedAlbums));
    try {
      refreshFromStorages();
    } catch (e) {}
  };

  // 画像アップロード処理（base64に変換して保存）
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target.result]); // ← base64で保存
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">📷 推し活アルバム</h1>

      {/* 入力フォーム */}
      <div className="bg-white shadow-md rounded-xl p-4 max-w-md mx-auto">
        <input
          type="date"
          className="w-full border rounded p-2 mb-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="タイトル (例: ライブ・誕生日記念)"
          className="w-full border rounded p-2 mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="コメント／思い出の記録"
          className="w-full border rounded p-2 mb-2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-2"
        />
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
        >
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
                  <div
                    key={index}
                    className="bg-white shadow-md rounded-xl overflow-hidden"
                  >
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-1">{album.title}</h3>
                      <p className="text-gray-700 flex-grow">{album.comment}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {album.images &&
                          album.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="saved"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(dateKey, index)}
                          className="px-3 py-1 bg-blue-400 text-white rounded"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(dateKey, index)}
                          className="px-3 py-1 bg-red-400 text-white rounded"
                        >
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

