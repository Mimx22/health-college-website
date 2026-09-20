const fs = require('fs');
const path = require('path');

const CWD = path.join(__dirname, '..');

// Create dummy test files in CWD
const createDummies = () => {
    ['test1.pdf', 'test2.pdf', 'test3.jpg', 'test4.jpg', 'test5.png', 'test6.png'].forEach(f => {
        fs.writeFileSync(path.join(CWD, f), 'dummy content');
    });
    fs.writeFileSync(path.join(CWD, 'test_bad.js'), 'console.log("bad")');
};

const cleanupDummies = () => {
    ['test1.pdf', 'test2.pdf', 'test3.jpg', 'test4.jpg', 'test5.png', 'test6.png', 'test_bad.js'].forEach(f => {
        const fp = path.join(CWD, f);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });
};

const buildBody = (overrides = {}, numDocs = 6, badType = false) => {
    const boundary = '----FormBoundary' + Math.random().toString(36).substr(2);
    
    const parts = [];
    const addField = (name, value) => {
        parts.push(
            `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}`
        );
    };

    if (overrides.fullName !== null) addField('fullName', overrides.fullName || 'John Doe Test');
    if (overrides.email !== null) addField('email', overrides.email || `testuser${Date.now()}@example.com`);
    if (overrides.phone !== null) addField('phone', overrides.phone || '09012345678');
    if (overrides.program !== null) addField('program', overrides.program || 'Nursing Science');

    const docFiles = [
        { name: 'test1.pdf', mime: 'application/pdf' },
        { name: 'test2.pdf', mime: 'application/pdf' },
        { name: 'test3.jpg', mime: 'image/jpeg' },
        { name: 'test4.jpg', mime: 'image/jpeg' },
        { name: 'test5.png', mime: 'image/png' },
        { name: 'test6.png', mime: 'image/png' },
        { name: 'test_bad.js', mime: 'application/javascript' },
    ];

    for (let i = 0; i < numDocs; i++) {
        const fileEntry = badType && i === 0 ? docFiles[6] : docFiles[i % 6];
        const content = fs.readFileSync(path.join(CWD, fileEntry.name));
        parts.push(
            `--${boundary}\r\nContent-Disposition: form-data; name="documents"; filename="${fileEntry.name}"\r\nContent-Type: ${fileEntry.mime}\r\n\r\n${content}`
        );
    }

    parts.push(`--${boundary}--`);
    const body = parts.join('\r\n');
    return { body, contentType: `multipart/form-data; boundary=${boundary}` };
};

async function runTest(name, overrides, numDocs, badType, expectedStatus) {
    const { body, contentType } = buildBody(overrides, numDocs, badType);
    try {
        const fetch = (await import('node-fetch')).default;
        const res = await fetch('http://localhost:5000/api/students/register', {
            method: 'POST',
            headers: { 'Content-Type': contentType },
            body
        });
        const data = await res.json();
        const passed = res.status === expectedStatus;
        console.log(`${passed ? '✅' : '❌'} ${name} | Expected: ${expectedStatus} | Got: ${res.status} | msg: ${data.message}`);
        return { status: res.status, data };
    } catch (e) {
        console.error(`❌ ${name} | FAILED: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log('\n--- STARTING MISSION 3 BACKEND TESTS ---\n');
    createDummies();

    // TEST 2: Missing fullName
    await runTest('TEST 2: Missing fullName',   { fullName: null }, 6, false, 400);
    // TEST 3: Missing email
    await runTest('TEST 3: Missing email',      { email: null }, 6, false, 400);
    // TEST 4: Missing program
    await runTest('TEST 4: Missing program',    { program: null }, 6, false, 400);
    // TEST 5: 5 documents
    await runTest('TEST 5: Only 5 documents',   {}, 5, false, 400);
    // TEST 6: 7 documents
    await runTest('TEST 6: 7 documents',        {}, 7, false, 400);
    // TEST 7: Bad file type
    await runTest('TEST 7: Bad file type (.js)',{}, 6, true,  400);
    // TEST 10: Valid fields, DB down → 500 + cleanup
    const t10result = await runTest('TEST 10: DB down (valid data)', {}, 6, false, 500);

    // Check uploads dir for orphaned files
    const uploadsDir = path.join(CWD, 'api', 'uploads');
    let orphanCount = 0;
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        orphanCount = files.length;
        console.log(`TEST 10 Cleanup: ${orphanCount === 0 ? '✅ 0 orphaned files' : `❌ ${orphanCount} orphaned files found`}`);
    }

    cleanupDummies();
    console.log('\n--- TESTS COMPLETE ---');
}

main();
