<?php

namespace App\Support;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Support\Collection;
use setasign\Fpdi\Fpdi;
use setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException;
use setasign\Fpdi\PdfParser\PdfParserException;
use Symfony\Component\Process\Process;

/**
 * Combining the PDFs of several linked documents into one file.
 *
 * The sources are left exactly as they are - this is a copy taken of them, not
 * a move - so the merged file is a new attachment on the document that did the
 * merging, and every source keeps its own trail intact.
 *
 * Page order is the order the caller passes the documents in, and within a
 * document its attachments oldest first, so a merged file reads in the order
 * the case was built.
 */
class DocumentMerge
{
    /** Only PDFs can be merged, which is also all the intake form accepts. */
    private const EXTENSION = 'pdf';

    /**
     * The command-line mergers this looks for, best first, each as the argument
     * list it takes. qpdf and poppler both read every PDF version in use; they
     * are only ever run with an argument array, never a shell string.
     */
    private const BINARIES = [
        'qpdf' => [self::class, 'qpdfArguments'],
        'pdfunite' => [self::class, 'pdfuniteArguments'],
        'gs' => [self::class, 'ghostscriptArguments'],
    ];

    /** @var array<string, string|null> */
    private static array $located = [];

    /** qpdf --empty --pages a.pdf b.pdf -- out.pdf */
    public static function qpdfArguments(array $paths, string $output): array
    {
        return array_merge(['--empty', '--pages'], $paths, ['--', $output]);
    }

    /** pdfunite a.pdf b.pdf out.pdf */
    public static function pdfuniteArguments(array $paths, string $output): array
    {
        return array_merge($paths, [$output]);
    }

    /** gs -sDEVICE=pdfwrite -sOutputFile=out.pdf a.pdf b.pdf */
    public static function ghostscriptArguments(array $paths, string $output): array
    {
        return array_merge(['-dBATCH', '-dNOPAUSE', '-q', '-sDEVICE=pdfwrite', '-sOutputFile='.$output], $paths);
    }

    /**
     * The PDF attachments of a document, oldest first.
     *
     * @return Collection<int, Attachment>
     */
    public static function mergeableAttachments(Task $task): Collection
    {
        return $task->attachments()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->filter(fn (Attachment $attachment) => self::isPdf($attachment))
            ->values();
    }

    /** How many pages a merge would draw from a document, for the picker. */
    public static function countFor(Task $task): int
    {
        return self::mergeableAttachments($task)->count();
    }

    /**
     * Merge $sources into a new attachment on $target.
     *
     * @param  Collection<int, Task>|array<int, Task>  $sources
     *
     * @throws DocumentMergeException when there is nothing to merge, or a
     *                                source PDF cannot be read
     */
    public static function run(Task $target, $sources, ?int $userId = null): Attachment
    {
        $files = [];

        foreach ($sources as $source) {
            foreach (self::mergeableAttachments($source) as $attachment) {
                $path = self::absolutePath($attachment);

                if ($path === null) {
                    throw new DocumentMergeException(__('The file ":name" is no longer on disk.', ['name' => $attachment->name]));
                }

                $files[] = ['path' => $path, 'name' => $attachment->name];
            }
        }

        if (empty($files)) {
            throw new DocumentMergeException(__('The documents chosen have no PDF to merge.'));
        }

        $fileName = uniqid().'-merged-'.($target->task_code ?: $target->id).'.'.self::EXTENSION;
        $relative = 'tasks/'.$fileName;
        $absolute = public_path('files/'.$relative);

        self::write(array_column($files, 'path'), $absolute, $files);

        return Attachment::create([
            'task_id' => $target->id,
            'name' => self::mergedName($target, count($files)),
            'user_id' => $userId ?: auth()->id(),
            'size' => is_file($absolute) ? filesize($absolute) : 0,
            'path' => '/files/'.$relative,
            'width' => null,
            'height' => null,
        ]);
    }

    /**
     * Write the merged file, by whichever means this server has.
     *
     * A PDF merger built into PHP would be simplest, and the one available -
     * FPDI's free parser - reads PDF 1.4 and earlier only. Almost nothing a
     * scanner or an office suite produces today is that old, so the tools
     * poppler and qpdf install are tried first and FPDI is the fallback for a
     * server that has neither.
     *
     * @param  array<int, string>  $paths  source files, in page order
     * @param  array<int, array>  $sources  the same list with names, for errors
     */
    private static function write(array $paths, string $output, array $sources): void
    {
        foreach (self::BINARIES as $binary => $arguments) {
            $executable = self::locate($binary);

            if ($executable === null) {
                continue;
            }

            $process = new Process(array_merge([$executable], $arguments($paths, $output)));
            $process->setTimeout(120);
            $process->run();

            if ($process->isSuccessful() && is_file($output) && filesize($output) > 0) {
                return;
            }

            // A tool that is present but failed is worth saying so about - the
            // next one down may well manage it, but if none do, this is what
            // went wrong rather than "no merger installed".
            report(new DocumentMergeException($binary.' could not merge the documents: '.trim($process->getErrorOutput() ?: $process->getOutput())));
        }

        self::writeWithFpdi($paths, $output, $sources);
    }

    /** The pure-PHP fallback. Reads PDF 1.4 and earlier only. */
    private static function writeWithFpdi(array $paths, string $output, array $sources): void
    {
        $pdf = new Fpdi;

        foreach ($paths as $index => $path) {
            try {
                $count = $pdf->setSourceFile($path);
            } catch (CrossReferenceException|PdfParserException $e) {
                // Naming the file matters: without it the page says "merge
                // failed" and nobody knows which document to go and re-save.
                throw new DocumentMergeException(__('":name" is in a PDF format this server cannot merge. Ask an administrator to install qpdf or poppler-utils on the server, or re-save the file as PDF 1.4 or older.', [
                    'name' => $sources[$index]['name'] ?? basename($path),
                ]));
            }

            for ($number = 1; $number <= $count; $number++) {
                $template = $pdf->importPage($number);
                $size = $pdf->getTemplateSize($template);

                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($template);
            }
        }

        $pdf->Output('F', $output);
    }

    /** Where a merger binary lives, or null when this server has not got it. */
    private static function locate(string $binary): ?string
    {
        if (array_key_exists($binary, self::$located)) {
            return self::$located[$binary];
        }

        $which = new Process(['which', $binary]);
        $which->run();

        $path = trim($which->getOutput());

        return self::$located[$binary] = ($which->isSuccessful() && $path !== '') ? $path : null;
    }

    /** What the merged file is called in the attachments list. */
    private static function mergedName(Task $target, int $files): string
    {
        $label = $target->task_code ?: ('#'.$target->id);

        return $label.' — '.__(':count merged files', ['count' => $files]).'.'.self::EXTENSION;
    }

    private static function isPdf(Attachment $attachment): bool
    {
        return strtolower(pathinfo((string) $attachment->name, PATHINFO_EXTENSION)) === self::EXTENSION
            || strtolower(pathinfo((string) $attachment->path, PATHINFO_EXTENSION)) === self::EXTENSION;
    }

    /**
     * The same containment check the attachment viewer uses: a stored path that
     * climbs out of the uploads directory resolves to nothing.
     */
    private static function absolutePath(Attachment $attachment): ?string
    {
        if (empty($attachment->path)) {
            return null;
        }

        $root = realpath(public_path('files'));
        $path = realpath(public_path(ltrim($attachment->path, '/')));

        if ($root === false || $path === false || !is_file($path)) {
            return null;
        }

        return str_starts_with($path, $root.DIRECTORY_SEPARATOR) ? $path : null;
    }
}
