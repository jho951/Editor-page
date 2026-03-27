import { useRef, useEffect, createContext, useContext } from 'react';

const CanvasContext = createContext(null);
const useCanvas = ()=> useContext(CanvasContext);

function CanvasProvider({children, width = 800, height = 800}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  const drawImage = (src, x = 0, y = 0, w, h) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      ctxRef.current.clearRect(0, 0, width, height);
      ctxRef.current.drawImage(img, x, y, w || img.width, h || img.height);
    };
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, width, height);
  };

  const destroy = () => {
    ctxRef.current = null;
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.width;
    }
  };

  return (
    <CanvasContext.Provider value={{canvasRef, ctxRef, drawImage, clearCanvas, destroy}}>
      <canvas ref={canvasRef} width={width} height={height}/>
      {children}
    </CanvasContext.Provider>
  );
}

export { CanvasProvider,useCanvas};
