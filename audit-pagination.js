const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function getAllRoutes(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllRoutes(filePath, fileList);
    } else if (filePath.endsWith('route.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routes = getAllRoutes(apiDir);
const results = [];

for (const route of routes) {
  const content = fs.readFileSync(route, 'utf-8');
  
  // Only check routes that have a GET method
  if (!content.includes('export async function GET') && !content.includes('export function GET')) continue;

  const relativePath = path.relative(apiDir, route).replace('/route.ts', '').replace('\\route.ts', '');
  
  const hasPaginationParams = content.includes('searchParams.get("page")') || content.includes("searchParams.get('page')");
  const hasPrismaPagination = content.includes('skip:') || content.includes('take:');
  
  // Also check if they get all data via findMany without pagination
  const usesFindMany = content.includes('.findMany(');

  results.push({
    endpoint: `/api/${relativePath}`,
    file: route,
    hasFindMany: usesFindMany,
    hasPagination: hasPaginationParams || hasPrismaPagination,
  });
}

// Filter only those that return lists (uses findMany) but are missing pagination
const missingPagination = results.filter(r => r.hasFindMany && !r.hasPagination);
const withPagination = results.filter(r => r.hasFindMany && r.hasPagination);

console.log('=== ENDPOINTS DENGAN PAGINASI ===');
withPagination.forEach(r => console.log(`[V] ${r.endpoint}`));

console.log('\n=== ENDPOINTS TANPA PAGINASI (MEMBUTUHKAN AUDIT) ===');
missingPagination.forEach(r => console.log(`[X] ${r.endpoint}`));
