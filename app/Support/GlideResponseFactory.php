<?php

namespace App\Support;

use Illuminate\Http\Request;
use League\Flysystem\FilesystemOperator;
use League\Glide\Responses\ResponseFactoryInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Turns a cached Glide image into a Laravel response.
 *
 * league/glide-laravel shipped this, but it never moved past its 1.0.0 release
 * and its Symfony dependency blocked the framework upgrade. It is a small
 * enough piece to own: stream the cached file back with the right headers and
 * honour conditional requests so a browser can keep using its copy.
 */
class GlideResponseFactory implements ResponseFactoryInterface
{
    public function __construct(private Request $request)
    {
    }

    public function create(FilesystemOperator $cache, string $path): StreamedResponse
    {
        $stream = $cache->readStream($path);

        $response = new StreamedResponse(function () use ($stream) {
            if (ftell($stream) !== 0) {
                rewind($stream);
            }
            fpassthru($stream);
            fclose($stream);
        });

        $response->headers->set('Content-Type', $cache->mimeType($path) ?: 'image/jpeg');
        $response->headers->set('Content-Length', (string) $cache->fileSize($path));
        $response->setPublic();
        $response->setMaxAge(31536000);
        $response->setExpires(now()->addYear());
        $response->setLastModified(now()->setTimestamp($cache->lastModified($path)));

        // A rendered image is immutable - the parameters are part of its path -
        // so an unchanged request can be answered with a 304.
        $response->setEtag(md5($path));
        $response->isNotModified($this->request);

        return $response;
    }
}
