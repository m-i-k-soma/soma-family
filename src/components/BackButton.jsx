import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // ホーム("/")には戻るボタンを表示しない
  if (location.pathname === "/") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg"
    >
      戻る
    </button>
  );
}

export default BackButton;

