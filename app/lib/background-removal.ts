import { spawn } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

interface RemovalOptions {
  refinementLevel: 'fast' | 'balanced' | 'detailed';
  keepShadows: boolean;
  backgroundColor: string | null;
}

export async function removeBackground(
  imageBuffer: Buffer,
  options: RemovalOptions
): Promise<Buffer> {
  const inputPath = join(tmpdir(), `${uuidv4()}.png`);
  const outputPath = join(tmpdir(), `${uuidv4()}.png`);

  try {
    // Save input image to temp file
    await sharp(imageBuffer).toFile(inputPath);

    // Build command arguments
    const args = ['rembg', 'i'];

    // Add model selection
    args.push('--model', 'u2net');

    // Add alpha matting for detailed mode
    if (options.refinementLevel === 'detailed') {
      args.push('--alpha-matting');
      args.push('--post-process-mask');
    }

    // Add background color if specified
    if (options.backgroundColor) {
      const color = options.backgroundColor.replace('#', '');
      const r = parseInt(color.substr(0, 2), 16);
      const g = parseInt(color.substr(2, 2), 16);
      const b = parseInt(color.substr(4, 2), 16);
      args.push('--bgcolor', r.toString(), g.toString(), b.toString(), '255');
    }

    // Add input and output paths
    args.push(inputPath, outputPath);

    // Run command
    await new Promise<void>((resolve, reject) => {
      const process = spawn('/usr/local/bin/python3', ['-m', ...args]);

      let errorOutput = '';
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Background removal failed with code ${code}: ${errorOutput}`));
        }
      });
    });

    // Read output image
    const outputBuffer = await sharp(outputPath).toBuffer();
    return outputBuffer;

  } catch (error) {
    console.error('Background removal error:', error);
    return imageBuffer;
  } finally {
    // Cleanup temp files
    try {
      await unlink(inputPath);
      await unlink(outputPath);
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

function getRefinementLevel(level: RemovalOptions['refinementLevel']): string {
  switch (level) {
    case 'fast':
      return '1';
    case 'balanced':
      return '2';
    case 'detailed':
      return '3';
    default:
      return '2';
  }
} 