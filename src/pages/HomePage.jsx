// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import soumaImage from "../assets/souma.png";
import lionIcon from "../assets/lion.png";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 p-6">
       <h1 className="text-3xl font-bold mb-6">そうまくんといっしょ</h1>
        <img src={soumaImage} alt="そうまくん" className="w-48 h-48 object-contain mb-4" />



      <Link to="/menu" className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-lg bg-yellow-400 hover:bg-yellow-500 text-black">
        <img src={lionIcon} alt="lion" className="w-6 h-6" />


        <span className="text-lg font-semibold text-black">スタート</span>
      </Link>

    </div>
  );
};

export default HomePage;
