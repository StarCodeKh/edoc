<?php

namespace App\Support;

/**
 * Reads and writes the .env file.
 *
 * Stands in for jackiedo/dotenv-editor, which stopped at Laravel 10 and so
 * blocked the framework upgrade. Only the handful of calls this app actually
 * made are kept - load, getKeys, keyExists, getValue, setKey, save - with the
 * same shapes, so the controllers read the same as they did before.
 *
 * Lines are edited in place: comments, blank lines and the order of existing
 * keys all survive a save, and a new key is appended at the end.
 */
class EnvFile
{
    private string $path;

    /** @var string[] every line of the file, without line endings */
    private array $lines = [];

    private function __construct(string $path)
    {
        $this->path = $path;
        $this->read();
    }

    public static function load(?string $path = null): self
    {
        return new self($path ?: app()->environmentFilePath());
    }

    private function read(): void
    {
        $this->lines = is_file($this->path)
            ? preg_split("/\r\n|\n|\r/", (string) file_get_contents($this->path))
            : [];
    }

    /** The line index holding $key, or null when it is not in the file. */
    private function indexOf(string $key): ?int
    {
        foreach ($this->lines as $i => $line) {
            if (preg_match('/^\s*(?:export\s+)?'.preg_quote($key, '/').'\s*=/', $line)) {
                return $i;
            }
        }

        return null;
    }

    public function keyExists(string $key): bool
    {
        return $this->indexOf($key) !== null;
    }

    /** The value as written, with surrounding quotes stripped. */
    public function getValue(string $key, $default = null)
    {
        $index = $this->indexOf($key);
        if ($index === null) {
            return $default;
        }

        $value = trim(substr($this->lines[$index], strpos($this->lines[$index], '=') + 1));

        // Trim an inline comment, but only outside quotes.
        if ($value !== '' && $value[0] !== '"' && $value[0] !== "'") {
            $value = trim(preg_replace('/\s+#.*$/', '', $value));
        }

        if (strlen($value) > 1 && (
            ($value[0] === '"' && substr($value, -1) === '"') ||
            ($value[0] === "'" && substr($value, -1) === "'")
        )) {
            $value = substr($value, 1, -1);
        }

        return $value;
    }

    /**
     * The same shape dotenv-editor returned: keyed by name, each entry
     * carrying at least key and value. Pass names to limit the result;
     * a name that is missing from the file comes back with an empty value.
     *
     * @param  string[]  $keys
     */
    public function getKeys(array $keys = []): array
    {
        if ($keys) {
            $out = [];
            foreach ($keys as $key) {
                $out[$key] = [
                    'line' => ($this->indexOf($key) ?? -1) + 1,
                    'export' => false,
                    'key' => $key,
                    'value' => $this->getValue($key, ''),
                    'comment' => '',
                ];
            }

            return $out;
        }

        $out = [];
        foreach ($this->lines as $i => $line) {
            if (preg_match('/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/', $line, $m)) {
                $out[$m[1]] = [
                    'line' => $i + 1,
                    'export' => str_starts_with(ltrim($line), 'export '),
                    'key' => $m[1],
                    'value' => $this->getValue($m[1], ''),
                    'comment' => '',
                ];
            }
        }

        return $out;
    }

    public function setKey(string $key, $value = null): self
    {
        $line = $key.'='.$this->format((string) $value);
        $index = $this->indexOf($key);

        if ($index === null) {
            // Keep the file tidy: no double blank line before an appended key.
            if ($this->lines && trim(end($this->lines)) !== '') {
                $this->lines[] = '';
            }
            $this->lines[] = $line;
        } else {
            $this->lines[$index] = $line;
        }

        return $this;
    }

    /** @param  array<string, mixed>  $data */
    public function setKeys(array $data): self
    {
        foreach ($data as $key => $value) {
            $this->setKey($key, $value);
        }

        return $this;
    }

    public function deleteKey(string $key): self
    {
        $index = $this->indexOf($key);
        if ($index !== null) {
            unset($this->lines[$index]);
            $this->lines = array_values($this->lines);
        }

        return $this;
    }

    /** Quote anything that would not survive a bare assignment. */
    private function format(string $value): string
    {
        if ($value === '') {
            return '';
        }

        if (preg_match('/[\s"\'#=]/', $value)) {
            return '"'.str_replace(['\\', '"'], ['\\\\', '\"'], $value).'"';
        }

        return $value;
    }

    public function save(): self
    {
        file_put_contents($this->path, implode(PHP_EOL, $this->lines), LOCK_EX);

        return $this;
    }
}
