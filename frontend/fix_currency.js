const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk('d:/aviarx/aviarx/frontend');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix the broken ? encoding
    content = content.replace(/\?(\d)/g, '৳$1');
    content = content.replace(/\?\$\{/g, '৳${');
    content = content.replace(/`\?\$\{/g, '`৳${');
    content = content.replace(/ \?\$\{/g, ' ৳${');
    content = content.replace(/−\?/g, '−৳');
    content = content.replace(/>\?0</g, '>৳0<');

    // Replace actual $ signs
    content = content.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, '৳$1'); 
    content = content.replace(/Subtotal \$/g, 'Subtotal ৳');
    content = content.replace(/Place Order — \$/g, 'Place Order — ৳');
    content = content.replace(/Price \(\$\)/g, 'Price (৳)');
    content = content.replace(/Original Price \(\$\)/g, 'Original Price (৳)');
    content = content.replace(/Fixed Amount \(\$\)/g, 'Fixed Amount (৳)');
    content = content.replace(/startsWith\("\\\$"\)/g, 'startsWith("৳")');
    content = content.replace(/startsWith\("\$"\)/g, 'startsWith("৳")');
    content = content.replace(/`\$\$\{/g, '`৳${');
    content = content.replace(/ \$\$\{/g, ' ৳${');
    content = content.replace(/"\$/g, '"৳');
    content = content.replace(/>\$/g, '>৳');
    content = content.replace(/\(\$\)/g, '(৳)');
    content = content.replace(/−\$/g, '−৳');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
