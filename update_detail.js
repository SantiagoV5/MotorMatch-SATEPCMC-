const fs = require('fs');
const p = 'Frontend/src/features/motorcycles/components/motorcycleDetail.jsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  /<MaintenanceEstimator motorcycle=\{motorcycle\} \/>Ãa \*\/\}/g,
  '<MaintenanceEstimator motorcycle={motorcycle} />\n\n        {/* GalerÃa */}'
);

fs.writeFileSync(p, content, 'utf8');
console.log('fixed detail page');
