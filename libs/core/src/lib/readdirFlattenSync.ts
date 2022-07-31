import { lstatSync, readdirSync } from 'fs';
import { resolve } from 'path';

export function readdirFlattenSync(
	entry: string,
): { fileName: string; path: string }[] {
	return Array.from(
		(function* () {
			const files = readdirSync(entry);
			for (const fileName of files) {
				const path = resolve(entry, fileName);
				if (lstatSync(path).isDirectory()) {
					yield* readdirFlattenSync(path);
				} else {
					yield { fileName, path };
				}
			}
		})(),
	);
}
