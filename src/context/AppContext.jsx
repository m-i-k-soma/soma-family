import React, { createContext, useContext, useState, useEffect  } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ✅ 初期値を指定
  const [bgColor, setBgColor] = useState("#FEF3C7");
  const [bgImage, setBgImage] = useState(null);
  const [bgm, setBgm] = useState(null);

  // ✅ localStorage から初期値を読み込む
  useEffect(() => {
    const storedColor = localStorage.getItem("bgColor");
    if (storedColor) setBgColor(storedColor);

    const storedImage = localStorage.getItem("bgImage");
    if (storedImage) setBgImage(storedImage);

    const storedBgm = localStorage.getItem("bgm");
    if (storedBgm) setBgm(storedBgm);
  }, []);

// ✅ 保存時に localStorage にも保存
    const saveSettings = ({ bgColor, bgImage, bgm }) => {
    if (bgColor !== undefined) {
      setBgColor(bgColor);
      localStorage.setItem("bgColor", bgColor);
    }
    if (bgImage !== undefined) {
      setBgImage(bgImage);
      localStorage.setItem("bgImage", bgImage);
    }
    if (bgm !== undefined) {
      setBgm(bgm);
      localStorage.setItem("bgm", bgm);
    }
  };



  return (
    <AppContext.Provider
      value={{
        bgColor,
        setBgColor,
        bgImage,
        setBgImage,
        bgm,
        setBgm,
        saveSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppContext);

