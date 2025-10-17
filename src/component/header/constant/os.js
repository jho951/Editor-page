const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const MOD = isMac ? 'Meta' : 'Control';

export { MOD, isMac };
