import React, { useState, useEffect } from "react";
import { useAppSettings } from "../context/AppContext";

export default function SettingPage() {
  const { bgColor, bgImage, bgm, saveSettings } = useAppSettings();

  const [tempBgColor, setTempBgColor] = useState(bgColor);
  const [tempBgImage, setTempBgImage] = useState(bgImage);
  const [tempBgm, setTempBgm] = useState(bgm);

  useEffect(() => {
    setTempBgColor(bgColor);
    setTempBgImage(bgImage);
    setTempBgm(bgm);
  }, [bgColor, bgImage, bgm]);

  // 背景色選択
  const handleColorChange = (color) => {
    setTempBgColor(color);
  };

  // 背景画像アップロード（base64）
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempBgImage(event.target.result); // ← base64
    };
    reader.readAsDataURL(file);
  };

  // BGM アップロード（base64）
  const handleBgmUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempBgm(event.target.result); // ← base64
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="min-h-screen p-6 transition-all duration-500"
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">⚙️ 設定ページ</h1>

      {/* 背景色 */}
      <div className="mb-6 p-4 border rounded-lg bg-white/70">
        <h2 className="text-lg font-semibold mb-2">背景色を選択</h2>
        <div className="flex gap-3 mb-3">
          <button
            className="w-10 h-10 rounded-full bg-yellow-100 border"
            onClick={() => handleColorChange("#FEF3C7")}
          />
          <button
            className="w-10 h-10 rounded-full bg-pink-100 border"
            onClick={() => handleColorChange("#FCE7F3")}
          />
          <button
            className="w-10 h-10 rounded-full bg-green-100 border"
            onClick={() => handleColorChange("#D1FAE5")}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => saveSettings({ bgColor: tempBgColor })}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            色を保存
          </button>
          <button
            onClick={() => {
              const defaultColor = "#FEF3C7";
              saveSettings({ bgColor: defaultColor });
              setTempBgColor(defaultColor);
            }}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            色をリセット
          </button>
        </div>
      </div>

      {/* 背景画像 */}
      <div className="mb-6 p-4 border rounded-lg bg-white/70">
        <h2 className="text-lg font-semibold mb-2">背景画像を設定</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {tempBgImage && (
          <div className="mt-3 relative">
            <img
              src={tempBgImage}
              alt="背景プレビュー"
              className="w-32 h-20 object-cover rounded"
            />
            <button
              onClick={() => {
                setTempBgImage(null);
                saveSettings({ bgImage: null });
              }}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => saveSettings({ bgImage: tempBgImage })}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            画像を保存
          </button>
        </div>
      </div>

      {/* BGM */}
      <div className="mb-6 p-4 border rounded-lg bg-white/70">
        <h2 className="text-lg font-semibold mb-2">BGM を設定</h2>
        <input type="file" accept="audio/*" onChange={handleBgmUpload} />
        {tempBgm && <p className="mt-2 text-sm text-gray-600">🎵 BGM が選択されています</p>}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => saveSettings({ bgm: tempBgm })}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            BGM を保存
          </button>
          {tempBgm && (
            <button
              onClick={() => {
                setTempBgm(null);
                saveSettings({ bgm: null });
              }}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              BGM を削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

