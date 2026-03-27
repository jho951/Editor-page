/** os 관련 타입*/
type UADataPlatform = { platform: string };

export type UADataLike = {
    platforms?: UADataPlatform[];
    platform?: string;
};
