const drawImage = (src, x = 0, y = 0, w, h, onLoad) => {
  const img = new window.Image();
  img.src = src;
  img.onload = () => {
    ctxRef.current.clearRect(0, 0, width, height);
    ctxRef.current.drawImage(img, x, y, w || img.width, h || img.height);
    if (onLoad) onLoad();
  };
};

export default drawImage;
