// Pulls the verified homepage / site data into JSON so the page generator reuses it verbatim.
const fs = require('fs');
const h = fs.readFileSync('assets/home5.js', 'utf8');
const s = fs.readFileSync('assets/site.js', 'utf8');
function slice(src, startRe, endMarker) {
  const i = src.search(startRe); if (i < 0) throw new Error('missing ' + startRe);
  const j = src.indexOf(endMarker, i); return src.slice(i, j + endMarker.length);
}
const A = 'assets/';
const GD = eval('(' + slice(h, /var GD=\[/, '\n  ];').replace(/^var GD=/, '').replace(/;$/, '') + ')');
const P = eval('(' + slice(h, /var P=\[/, '\n  ];').replace(/^var P=/, '').replace(/;$/, '') + ')');
const FIN = eval('(' + slice(h, /var FIN=\[/, '\n  ];').replace(/^var FIN=/, '').replace(/;$/, '') + ')');
const KL = eval('(' + slice(s, /const KITCHEN_LAYOUTS=\[/, '\n];').replace(/^const KITCHEN_LAYOUTS=/, '').replace(/;$/, '') + ')');
const CITIES = eval('(' + slice(s, /const CITIES=\[/, '\n];').replace(/^const CITIES=/, '').replace(/;$/, '') + ')');
fs.writeFileSync(process.argv[2], JSON.stringify({ GD, P, FIN, KL, CITIES }, null, 1));
console.log(GD.length, P.length, FIN.length, KL.length, CITIES.length);
