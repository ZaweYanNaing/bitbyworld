<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateStorageToR2 extends Command
{
    protected $signature = 'storage:migrate-to-r2';
    protected $description = 'Copy all files from local public disk to Cloudflare R2';

    public function handle(): int
    {
        $localDisk = Storage::disk('public');
        $r2Disk = Storage::disk('r2');

        $files = $localDisk->allFiles();

        if (empty($files)) {
            $this->info('No files found in local storage. Nothing to migrate.');
            return 0;
        }

        $this->info("Found " . count($files) . " file(s) to migrate.");
        $bar = $this->output->createProgressBar(count($files));
        $bar->start();

        $migrated = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($files as $file) {
            // Skip .gitignore and hidden files
            if (str_starts_with(basename($file), '.')) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // Skip if already exists in R2
            if ($r2Disk->exists($file)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            try {
                $stream = $localDisk->readStream($file);
                $r2Disk->writeStream($file, $stream, ['visibility' => 'public']);

                if (is_resource($stream)) {
                    fclose($stream);
                }

                $migrated++;
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Failed to migrate: {$file} — {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Migration complete: {$migrated} migrated, {$skipped} skipped, {$failed} failed.");

        return $failed > 0 ? 1 : 0;
    }
}
