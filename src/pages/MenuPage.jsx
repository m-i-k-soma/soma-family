// src/pages/MenuPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const MenuPage = () => {
  const menuItems = [
    { path: "/schedule", label: "スケジュール管理", icon: "📅" },
    { path: "/stream", label: "配信記録", icon: "🎤" },
    { path: "/album", label: "推し活アルバム", icon: "📷" },
    { path: "/music", label: "楽曲集", icon: "🎵" },
    { path: "/setting", label: "設定", icon: "⚙️" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <h1 className="text-3xl font-bold mb-6 text-gray-800">📖 メニュー</h1>
       <div className="space-y-4 w-72">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between px-6 py-4 rounded-xl bg-yellow-400 shadow hover:bg-yellow-500 transition"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-lg font-semibold text-gray-800">
              {item.label}
            </span>
            <span className="text-xl">🐾</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;

