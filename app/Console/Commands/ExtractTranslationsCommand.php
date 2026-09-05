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
    protected $signature = 'translations:extract
                            {--sync : Add every missing key to the lang/*.json files, keyed to itself}
                            {--output= : Write the extracted key list to this path instead of the default}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract translation keys from the whole app and report or sync the lang/*.json files.';

    /**
     * Where to look. Blade and PHP carry as many keys as Vue does — the old
     * Vue-only scan is what let the error pages and flash messages drift.
     *
     * @var array<int, string>
     */
    protected $scanPaths = [
        'resources/js',
        'resources/views',
        'app',
        'routes',
        'config',
        'database',
    ];

    /**
     * Extensions worth reading in those paths.
     *
     * @var array<int, string>
     */
    protected $extensions = ['vue', 'js', 'php'];

    /**
     * Default report location. Deliberately outside lang/, because Vite globs
     * lang/*.json and would bundle anything dropped there as a real locale.
     *
     * @var string
     */
    protected $defaultOutput = 'storage/app/translations/extracted.json';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $keys = $this->scan();

        if (empty($keys)) {
            $this->warn('No translation keys were found.');

            return self::SUCCESS;
        }

        $phpKeys = array_filter($keys, fn ($key) => $this->belongsToPhpLangFile($key));
        $jsonKeys = array_values(array_diff($keys, $phpKeys));

        $this->info(count($keys).' keys in use ('.count($jsonKeys).' JSON, '.count($phpKeys).' from lang/<locale>/*.php).');

        $locales = $this->locales();

        if (empty($locales)) {
            $this->warn('No lang/*.json files to compare against.');

            return self::SUCCESS;
        }

        $exit = $this->report($locales, $jsonKeys);

        $this->writeReport($jsonKeys, $phpKeys);

        return $exit;
    }

    /**
     * Every distinct key passed to a translation helper, sorted.
     *
     * @return array<int, string>
     */
    protected function scan(): array
    {
        // $t / __ / trans / trans_choice, single- or double-quoted, escapes
        // allowed inside. trans_choice comes first so "trans" cannot eat it.
        $pattern = <<<'REGEX'
        /(?<![\w$>])(?:\$t|__|trans_choice|trans|wTrans)\s*\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/u
        REGEX;

        $keys = [];

        foreach ($this->scanPaths as $path) {
            $directory = base_path($path);

            if (!File::isDirectory($directory)) {
                continue;
            }

            $finder = (new Finder)
                ->in($directory)
                ->exclude(['node_modules', 'vendor'])
                ->name(array_map(fn ($ext) => '*.'.$ext, $this->extensions))
                ->files();

            foreach ($finder as $file) {
                // This file holds the pattern above as a literal, so scanning
                // it would harvest the regex's own "$t(" as a key.
                if ($file->getRealPath() === __FILE__) {
                    continue;
                }

                preg_match_all($pattern, $file->getContents(), $matches, PREG_SET_ORDER);

                foreach ($matches as $match) {
                    // preg drops trailing groups that did not take part, so a
                    // set of three means the double-quoted branch matched.
                    [$raw, $quote] = isset($match[2]) ? [$match[2], '"'] : [$match[1], "'"];

                    if ($raw === '') {
                        continue;
                    }

                    $keys[$this->unescape($raw, $quote)] = true;
                }
            }
        }

        $keys = array_keys($keys);
        sort($keys, SORT_STRING);

        return $keys;
    }

    /**
     * Undo the source-level escaping so the key matches what lands in JSON.
     */
    protected function unescape(string $raw, string $quote): string
    {
        return str_replace(['\\'.$quote, '\\\\'], [$quote, '\\'], $raw);
    }

    /**
     * Dotted keys such as "auth.failed" resolve against lang/<locale>/auth.php,
     * not the JSON files, so they must not be counted as JSON gaps.
     */
    protected function belongsToPhpLangFile(string $key): bool
    {
        if (!str_contains($key, '.') || str_contains($key, ' ')) {
            return false;
        }

        static $groups = null;

        if ($groups === null) {
            $groups = [];
            $directory = lang_path(config('app.fallback_locale', 'en'));

            if (File::isDirectory($directory)) {
                foreach (File::files($directory) as $file) {
                    $groups[] = $file->getFilenameWithoutExtension();
                }
            }
        }

        return in_array(strtok($key, '.'), $groups, true);
    }

    /**
     * The locales that have a lang/<locale>.json file.
     *
     * @return array<int, string>
     */
    protected function locales(): array
    {
        $locales = [];

        foreach (File::glob(lang_path('*.json')) as $path) {
            $name = pathinfo($path, PATHINFO_FILENAME);

            // laravel-vue-i18n compiles lang/<locale>/*.php down to
            // lang/php_<locale>.json for the Vue side. Generated, gitignored,
            // and not a locale we hand-maintain.
            if (str_starts_with($name, 'php_')) {
                continue;
            }

            $locales[] = $name;
        }

        sort($locales);

        return $locales;
    }

    /**
     * Print the per-locale gaps, optionally filling them in.
     *
     * @param  array<int, string>  $locales
     * @param  array<int, string>  $keys
     */
    protected function report(array $locales, array $keys): int
    {
        $sync = $this->option('sync');
        $incomplete = false;

        $union = [];
        $loaded = [];

        foreach ($locales as $locale) {
            $loaded[$locale] = $this->load($locale);
            $union += $loaded[$locale];
        }

        foreach ($locales as $locale) {
            $translations = $loaded[$locale];

            // A locale is short both of keys the code uses and of keys its
            // siblings carry — the switcher exposes all of them side by side.
            $missing = array_values(array_unique(array_diff(
                array_merge($keys, array_keys($union)),
                array_keys($translations)
            )));
            sort($missing, SORT_STRING);

            if (empty($missing)) {
                $this->line("  <info>✓</info> {$locale}.json — ".count($translations).' keys, nothing missing');

                continue;
            }

            $incomplete = true;
            $this->line("  <comment>!</comment> {$locale}.json — ".count($missing).' missing');

            foreach ($missing as $key) {
                $this->line('      '.$key);
            }

            if ($sync) {
                foreach ($missing as $key) {
                    // English source strings, so the key doubles as a usable
                    // fallback until somebody translates it.
                    $translations[$key] = $key;
                }

                $this->save($locale, $translations);
                $this->line("      <info>added to {$locale}.json</info>");
            }
        }

        $unused = array_values(array_diff(array_keys($union), $keys));
        sort($unused, SORT_STRING);

        if (!empty($unused)) {
            $this->newLine();
            $this->line('  <comment>'.count($unused).'</comment> keys in the lang files are not referenced by a literal.');
            $this->line('  <comment>Not safe to delete blindly</comment> — keys built at runtime, e.g. $t(listItem.title), land here too.');
        }

        if ($incomplete && !$sync) {
            $this->newLine();
            $this->line('  Run with <comment>--sync</comment> to add the missing keys.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @return array<string, string>
     */
    protected function load(string $locale): array
    {
        $path = lang_path($locale.'.json');

        if (!File::exists($path)) {
            return [];
        }

        return json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR) ?: [];
    }

    /**
     * @param  array<string, string>  $translations
     */
    protected function save(string $locale, array $translations): void
    {
        ksort($translations, SORT_STRING);

        File::put(
            lang_path($locale.'.json'),
            json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE).PHP_EOL
        );
    }

    /**
     * @param  array<int, string>  $jsonKeys
     * @param  array<int, string>  $phpKeys
     */
    protected function writeReport(array $jsonKeys, array $phpKeys): void
    {
        $output = $this->option('output') ?: $this->defaultOutput;
        $path = str_starts_with($output, '/') ? $output : base_path($output);

        if (str_starts_with(realpath(dirname($path)) ?: dirname($path), lang_path())) {
            $this->warn('Refusing to write inside lang/ — Vite would bundle it as a locale.');

            return;
        }

        File::ensureDirectoryExists(dirname($path));

        File::put($path, json_encode([
            'json' => array_combine($jsonKeys, $jsonKeys),
            'php' => $phpKeys,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE).PHP_EOL);

        $this->newLine();
        $this->line("  Key list written to <comment>{$output}</comment>");
    }
}
