const crypto = require('crypto');
const Student = require('../models/Student');

/**
 * Normalizes any program name to its official two-letter uppercase code.
 * Confirmed:
 *  - Nursing Sciences -> NS
 *  - Public Health (Degree or Diploma) -> PH
 *  - Dental Technology (Degree or Diploma) -> DT
 *  - Community Health (Degree or CHEW) -> CH
 *  - Medical Laboratory Sciences -> ML
 *  - Pharmacy -> PC
 *  - Biochemistry -> BC
 *  - Microbiology -> MC
 *  - Computer Sciences / Computer Science -> CS
 *  - Health Information Management -> HM
 *  - Legacy Diploma options mapped cleanly (Mass Comm: MC, Pub Admin: PA, Bus Admin: BA, Hotel: OH)
 */
function getProgramCode(program) {
    if (!program || typeof program !== 'string') return 'GEN';

    const p = program.trim().toLowerCase();

    if (p.includes('nursing')) return 'NS';
    if (p.includes('dental')) return 'DT';
    if (p.includes('public health')) return 'PH';
    if (p.includes('community health') || p.includes('chew')) return 'CH';
    if (p.includes('medical laboratory') || p.includes('med lab')) return 'ML';
    if (p.includes('pharmacy')) return 'PC';
    if (p.includes('biochemistry')) return 'BC';
    if (p.includes('microbiology')) return 'MC';
    if (p.includes('computer')) return 'CS';
    if (p.includes('health information') || p.includes('him')) return 'HM';
    if (p.includes('mass com')) return 'MC';
    if (p.includes('public admin')) return 'PA';
    if (p.includes('business admin')) return 'BA';
    if (p.includes('hotel') || p.includes('office')) return 'OH';

    return 'GS'; // General Studies default
}

/**
 * Extracts all already-assigned random number identifiers across the entire school
 * from all existing studentId values (e.g. MCH/2026/NS/56 -> 56).
 */
async function getUsedRandomNumbers(excludeStudentId = null) {
    const query = { studentId: { $ne: null } };
    if (excludeStudentId) {
        query._id = { $ne: excludeStudentId };
    }

    const students = await Student.find(query, 'studentId').lean();
    const usedNumbers = new Set();

    for (const s of students) {
        if (!s.studentId) continue;
        const parts = s.studentId.trim().split('/');
        if (parts.length === 4 && parts[0].toUpperCase() === 'MCH') {
            const num = parseInt(parts[3], 10);
            if (!isNaN(num)) {
                usedNumbers.add(num);
            }
        }
    }

    return usedNumbers;
}

/**
 * Generates a unique, non-sequential random integer across the entire school.
 * First draws randomly from 01..99. If all 1..99 are exhausted, draws from 100+.
 *
 * @param {Set<number>} usedNumbersSet - Set of numbers already assigned across the school.
 */
function pickUniqueRandomNumber(usedNumbersSet) {
    // Collect all available numbers in the 1..99 range
    const availableTwoDigits = [];
    for (let i = 1; i <= 99; i++) {
        if (!usedNumbersSet.has(i)) {
            availableTwoDigits.push(i);
        }
    }

    if (availableTwoDigits.length > 0) {
        // Randomly select one using cryptographic randomness
        const randomIndex = crypto.randomInt(0, availableTwoDigits.length);
        const chosen = availableTwoDigits[randomIndex];
        usedNumbersSet.add(chosen);
        return chosen;
    }

    // Two digits exhausted: pick random number in 100..999
    let attempts = 0;
    while (attempts < 1000) {
        const candidate = crypto.randomInt(100, 1000);
        if (!usedNumbersSet.has(candidate)) {
            usedNumbersSet.add(candidate);
            return candidate;
        }
        attempts++;
    }

    // Fallback: next highest available
    let fallback = 100;
    while (usedNumbersSet.has(fallback)) {
        fallback++;
    }
    usedNumbersSet.add(fallback);
    return fallback;
}

/**
 * Generates an authoritative, collision-resistant student ID in the format:
 * MCH/[ADMISSION YEAR]/[PROGRAMME CODE]/[RANDOM UNIQUE NUMBER]
 *
 * Safe under concurrency with retry loops and MongoDB index enforcement.
 *
 * @param {number|string} admissionYear - e.g. 2025 or 2026
 * @param {string} program - Full program name
 * @param {string|ObjectId} [excludeDocId] - Optional student _id when updating/migrating
 */
let generationLock = Promise.resolve();
const inFlightReservedNumbers = new Set();

async function generateStudentId(admissionYear, program, excludeDocId = null) {
    const doGenerate = async () => {
        const year = parseInt(admissionYear, 10) || new Date().getFullYear();
        const progCode = getProgramCode(program);

        let maxAttempts = 50;
        while (maxAttempts > 0) {
            maxAttempts--;
            const usedNumbers = await getUsedRandomNumbers(excludeDocId);
            // Include currently in-flight reserved numbers
            for (const n of inFlightReservedNumbers) {
                usedNumbers.add(n);
            }

            const randomNum = pickUniqueRandomNumber(usedNumbers);
            const candidateId = `MCH/${year}/${progCode}/${randomNum}`;

            // Verify across entire database that neither this exact full ID nor this random suffix is taken
            const conflict = await Student.findOne({
                $or: [
                    { studentId: candidateId },
                    { studentId: new RegExp(`^MCH/\\d{4}/[A-Z]{2,3}/${randomNum}$`, 'i') }
                ],
                ...(excludeDocId ? { _id: { $ne: excludeDocId } } : {})
            });

            if (!conflict) {
                inFlightReservedNumbers.add(randomNum);
                // Keep reservation for 30s to allow student document saving
                setTimeout(() => inFlightReservedNumbers.delete(randomNum), 30000);
                return candidateId;
            }
        }

        throw new Error('Failed to generate a unique MCH student ID after multiple attempts');
    };

    const run = generationLock.then(doGenerate, doGenerate);
    generationLock = run;
    return run;
}

module.exports = {
    getProgramCode,
    getUsedRandomNumbers,
    pickUniqueRandomNumber,
    generateStudentId
};
