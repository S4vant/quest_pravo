// engine/time-store.js
import { getBestTime } from '../api/api.js';
export const progressStore = {
    _loaded: false,
    _raw: null,
    _bestTimes: new Map(),

    makeKey(stage, question) {
        return `${stage}:${question}`;
    },

    loadFromServer(data) {
        this._raw = data;
        this._bestTimes.clear();

        if (!data?.stages) return;

        for (const stage of data.stages) {
            for (const q of stage.questions || []) {
                if (q.wasted_time != null) {
                    this._bestTimes.set(
                        this.makeKey(stage.stage, q.q),
                        q.wasted_time
                    );
                }
            }
        }

        this._loaded = true;
    },

    getBest(stage, question) {
        return this._bestTimes.get(this.makeKey(stage, question)) ?? null;
    },

    setBest(stage, question, time) {
        this._bestTimes.set(this.makeKey(stage, question), time);
    },

    isLoaded() {
        return this._loaded;
    }
};

export async function preloadBestTimes(stage, questions) {
    for (const q of questions) {
        const best = await getBestTime(stage, q);
        console.log(best, "best");
        timeStore.setBest(stage, q, best);
    }
}