import { useDispatch } from 'react-redux';

import './fileInput.css';

const FileInput = () => {
    const dispatch = useDispatch();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
    };

    return (
        <>
            <label htmlFor="file" className="file-label">
                붙여넣기
            </label>
            <input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
        </>
    );
};

export default FileInput;
