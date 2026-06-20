const fs = require('fs');
const path = require('path');

const files = [
  'f:/trongan/vocal-master/frontend/src/pages/VocalRangeTest.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardAdmin.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardAIEvaluate.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardHome.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardPronunciation.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardQuests.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardSettings.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/dashboard/DashboardUpload.tsx',
  'f:/trongan/vocal-master/frontend/src/pages/results/ResultsScreen.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Determine path to context based on file depth
  // pages/VocalRangeTest.tsx -> ../contexts/AlertContext
  // pages/dashboard/... -> ../../contexts/AlertContext
  // pages/results/... -> ../../contexts/AlertContext
  const relativePath = file.includes('/dashboard/') || file.includes('/results/') ? '../../contexts/AlertContext' : '../contexts/AlertContext';
  
  const importStatement = `import { useAlert } from "${relativePath}";\n`;
  
  if (!content.includes('useAlert')) {
    // Add import after other imports
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
  }

  // Inject hook into component
  // We need to find the main component declaration
  const componentMatch = content.match(/export default function \w+\([^)]*\) \{|const \w+ = \([^)]*\) => \{/);
  
  if (componentMatch && !content.includes('const { showAlert } = useAlert();')) {
    const insertPos = componentMatch.index + componentMatch[0].length;
    content = content.slice(0, insertPos) + '\n  const { showAlert } = useAlert();' + content.slice(insertPos);
  }

  // Replace alert( with showAlert(
  // Need to be careful not to replace things indiscriminately, but alert( is standard.
  content = content.replace(/\balert\(/g, 'showAlert(');

  fs.writeFileSync(file, content);
  console.log('Updated', file);
});
