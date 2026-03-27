
import { useCanvas } from './CanvasProvider';

const CanvasControl = () => {
  const {drawImage, clearCanvas} = useCanvas();
  return (
    <section>
      <button onClick={drawImage}>불러오기</button>
      <button onClick={clearCanvas}>지우기</button>
    </section>
  );
};

export default CanvasControl;
