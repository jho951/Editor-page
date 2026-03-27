import { useEffect } from 'react';
import { useCanvas } from './CanvasProvider';
import useImageUrl from '../../hook/UseImageUrl';


function ImageDrawer({ src, x = 0, y = 0, w, h }) {
  const { drawImage } = useCanvas();
  const url = useImageUrl(src);

  useEffect(() => {
    if (url) {
      drawImage(url, x, y, w, h, () => {URL.revokeObjectURL(url)
      });
    }
  }, [url, drawImage, x, y, w, h]);

  return null;
}

export default ImageDrawer;
