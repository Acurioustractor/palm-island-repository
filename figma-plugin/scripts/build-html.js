const fs = require('fs');
const path = require('path');

// Read the built UI JS
const uiJsPath = path.join(__dirname, '../dist/ui.js');
const uiJs = fs.existsSync(uiJsPath) ? fs.readFileSync(uiJsPath, 'utf-8') : '';

// Create the HTML with inlined JS
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PICC Annual Report Exporter</title>
</head>
<body>
  <div id="root"></div>
  <script>${uiJs}</script>
</body>
</html>`;

// Write the HTML file
const distPath = path.join(__dirname, '../dist/ui.html');
fs.writeFileSync(distPath, html);
console.log('Built ui.html');
