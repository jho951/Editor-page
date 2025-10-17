/**
 * @property {width} canvas 벡터 좌표계 기반 너비
 * @property {height} canvas 벡터 좌표계 기반 높이
 * @property {background} canvas 배경 (null: 투명)
 * @property {grid} canvas 그리드 설정
 * @property {enabled} grid 활성화 여부
 * @property {size} grid 격자 크기
 */
const CANVAS = {
    width: 800,
    height: 600,
    background: null,
    grid: {
        enabled: false,
        size: 10,
    },
};

/**
 * @property {items} 문서 목록
 * @property {currentId} 현재 문서 ID
 * @property {title} 현재 문서 제목
 * @property {version} 현재 문서 버전
 * @property {width} 현재 문서 너비
 * @property {height} 현재 문서 높이
 * @property {updatedAt} 마지막 수정 시각 (ISO 8601)
 * @property {loading} 로딩 상태
 * @property {error} 에러 메시지
 */
const DOC = {
    items: [],
    currentId: null,
    title: 'Untitled',
    version: 0,
    width: null,
    height: null,
    updatedAt: null,
    loading: false,
    error: null,
    ui: { loadOpen: false, saveOpen: false },
};

/**
 *  @property {past} [{ canvas, layers, render, hitmap }]
 *  @property {future} [{ canvas, layers, render, hitmap }]
 *  @property {applied} pop 시 일시 저장
 */
const HISTORY = {
    past: [],
    future: [],
    applied: null,
};

/**
 * @property {zoom} 확대/축소 배율
 * @property {pan} 뷰포트 이동 좌표
 * @property {minZoom} 최소 축소 배율
 * @property {maxZoom} 최대 확대 배율
 */
const VIEWPORT = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    minZoom: 0.1,
    maxZoom: 10,
    rotation: 0,
};

/**
 *  @property {tool} [{ canvas, layers, render, hitmap }]
 *  @property {draft} [{ canvas, layers, render, hitmap }]
 *  @property {selectionRect} pop 시 일시 저장
 *  @property {cursor} pop 시 일시 저장
 */
const TOOL_DEFAULT = {
    tool: 'select',
    draft: { stroke: '#111', fill: 'transparent', strokeWidth: 2 },
};

/**
 * @property {mode} 'none' | 'path' | 'text' | 'transform'
 */
const EDIT = {
    mode: 'none',
    targetId: null, // 편집 대상 도형 id
    hoverNode: null, // { index } | null
    draggingNode: null, // { index, start:{x,y} } | null
    handle: null, // 'N'|'NE'|...|'ROTATE' | null  (transform)
    origin: null, // {x,y}                          (transform)
};

const RENDER = {
    dirty: { vector: true, overlay: true, hitmap: true },
};

/**
 * @description selectionSlice 초기 상태값
 * @property {ids}  현재 선택된 도형 하나의 id
 * @property {anchor} path 노드 선택 { id, index }
 */
const SELCECTION = {
    id: null,
    anchor: null,
};

const SHAPE = { list: [] };

export const DEFAULT = {
    CANVAS,
    DOC,
    EDIT,
    HISTORY,
    RENDER,
    SHAPE,
    SELCECTION,
    TOOL_DEFAULT,
    VIEWPORT,
};
