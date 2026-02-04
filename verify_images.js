const fs = require('fs');
const path = require('path');

const deitiesPath = path.join(process.cwd(), 'apps/web/src/data/deities.json');
const publicDeitiesPath = path.join(process.cwd(), 'apps/web/public');

const deities = JSON.parse(fs.readFileSync(deitiesPath, 'utf8'));
const missing = [];

deities.forEach(d => {
    if (d.imageUrl && d.imageUrl.startsWith('/deities/')) {
        const localPath = path.join(publicDeitiesPath, d.imageUrl);
        if (!fs.existsSync(localPath)) {
            missing.push(`${d.name} (${d.id}): ${d.imageUrl}`);
        }
    }
});

if (missing.length > 0) {
    console.log('Missing images found:');
    missing.forEach(m => console.log(m));
    process.exit(1);
} else {
    console.log('All local image references are valid.');
}
