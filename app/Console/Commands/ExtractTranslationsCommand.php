<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Finder\Finder;

class ExtractTranslationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translations:extract';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract translation keys from Vue files and save to a JSON file.';

    /**
     * The path to scan for Vue files.
     *
     * @var string
     */
    protected $scanPath = 'resources/js';

    /**
     * The path to the output JSON file.
     *
     * @var string
     */
    protected $outputPath = 'lang/extracted.json';

    /**
     * Regex to find translation keys.
     * This pattern looks for $t('key'), $t("key"), {{ $t('key') }}, etc.
     *
     * @var string
     */
    protected $regex = '/\$t\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)/';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info("Scanning for translation keys in {$this->scanPath}...");

        $finder = new Finder;
        $finder->in(base_path($this->scanPath))->name('*.vue')->files();

        $allKeys = [];

        foreach ($finder as $file) {
            $contents = $file->getContents();
            preg_match_all($this->regex, $contents, $matches);

            if (!empty($matches[1])) {
                $allKeys = array_merge($allKeys, $matches[1]);
            }
        }

        // Get unique keys and sort them alphabetically
        $uniqueKeys = array_unique($allKeys);
        sort($uniqueKeys);

        if (empty($uniqueKeys)) {
            $this->warn('No translation keys were found.');

            return 0;
        }

        // Create a key => value array for the JSON file
        $translationJson = array_combine($uniqueKeys, $uniqueKeys);

        // Ensure the output directory exists
        File::ensureDirectoryExists(dirname(base_path($this->outputPath)));

        // Write the JSON file
        File::put(
            base_path($this->outputPath),
            json_encode($translationJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );

        $this->info('Successfully extracted '.count($uniqueKeys).' keys.');
        $this->line("Result saved to: <comment>{$this->outputPath}</comment>");

        return 0;
    }
}
