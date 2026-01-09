export const stageDataStore = {
    _stages: new Map(),

    has(stage) {
        return this._stages.has(stage);
    },

    set(stage, data) {
        this._stages.set(stage, data);
    },

    getStage(stage) {
        return this._stages.get(stage) || null;
    },

    getQuestion(stage, question) {
        const stageData = this.getStage(stage);
        if (!stageData) return null;
        return stageData.questions?.[question] ?? null;
    }
};
