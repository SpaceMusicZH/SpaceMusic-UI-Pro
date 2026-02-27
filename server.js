import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { existsSync } from 'node:fs';

const PORT = process.env.PORT || 8000;
const ROOT = process.cwd();

const MIME_TYPES = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.mjs': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.wasm': 'application/wasm',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.dat': 'application/octet-stream',
	'.dll': 'application/octet-stream',
	'.blat': 'application/octet-stream',
	'.pdb': 'application/octet-stream',
};

const server = createServer(async (req, res) => {
	let filePath = join(ROOT, decodeURIComponent(req.url.split('?')[0]));

	if (filePath.endsWith('/')) filePath = join(filePath, 'index.html');
	if (!extname(filePath) && existsSync(filePath + '.html')) filePath += '.html';
	if (!extname(filePath) && existsSync(join(filePath, 'index.html'))) filePath = join(filePath, 'index.html');

	try {
		const data = await readFile(filePath);
		const ext = extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || 'application/octet-stream';
		res.writeHead(200, { 'Content-Type': contentType });
		res.end(data);
	} catch {
		// Fallback to index.html for SPA routing
		try {
			const index = await readFile(join(ROOT, 'index.html'));
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(index);
		} catch {
			res.writeHead(404);
			res.end('Not Found');
		}
	}
});

server.listen(PORT, () => {
	console.log(`Static server running on port ${PORT}`);
});
