

import { initQuestion1, checkQuestion1 } from './q1_definition.js';
import { initQuestion2, checkQuestion2 } from './q2_definition.js';
import { initQuestion3, checkQuestion3 } from './q3_coincidence.js';
import { initQuestion4, checkQuestion4 } from './q4_violations.js';
import { initQuestion5, checkQuestion5 } from './q5_crossword.js';
export const questionHandlers = {
    1: {
        init: initQuestion1,
        check: checkQuestion1
    },
    2: {
        init: initQuestion2,
        check: checkQuestion2
    },
    3: {
        init: initQuestion3,
        check: checkQuestion3
    },
    4: {
        init: initQuestion4,
        check: checkQuestion4
    },
    5: {
        init: initQuestion5,
        check: checkQuestion5
    }
};