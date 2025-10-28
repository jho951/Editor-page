import { HEADER_NAME } from './header.initial';
import { createSelector } from '@reduxjs/toolkit';

// 루트 안전 접근
export const selectHeader = (s) => s?.[HEADER_NAME] ?? {};

// 툴
export const selectTool = (s) => selectHeader(s).tool;

// 뷰(객체 단위: 조심해서 사용)
export const selectView = (s) =>
    selectHeader(s).view || { scale: 1, tx: 0, ty: 0 };
// 프리미티브 단위 (권장)
export const selectZoom = (s) => selectView(s).scale ?? 1;
export const selectX = (s) => selectView(s).tx ?? 0;
export const selectY = (s) => selectView(s).ty ?? 0;

// 배경색 (state 키에 맞춤)
export const selectCanvasBg = (s) => selectHeader(s).background ?? '#ffffff';

// 사이드바 열림
export const selectSidebarOpen = (s) => selectHeader(s).sidebarOpen ?? null;

// 섹션 활성 (정확한 키 이름)
export const selectSectionActive = (s) => selectHeader(s).sectionActive ?? {};
export const selectActiveFile = (s) => selectSectionActive(s).file ?? null;
export const selectActiveShape = (s) => selectSectionActive(s).shape ?? null;
export const selectActiveZoom = (s) => selectSectionActive(s).zoom ?? null;

// 파생 셀렉터 (reselect 예시): 특정 섹션이 열려있는지
export const selectIsSectionOpen = (key) =>
    createSelector(selectSidebarOpen, (open) => open === key);

// 도형 섹션이 path/freedraw를 포함해 활성인지 (툴 상태와 조합)
export const selectIsShapeActive = createSelector(
    selectTool,
    selectActiveShape,
    (tool, shapeActive) => {
        // shapeActive는 드롭다운에서 마지막 선택,
        // tool은 현재 실제 편집중인 도구
        const normalizedTool = tool === 'freedraw' ? 'path' : tool;
        return normalizedTool === shapeActive;
    }
);
