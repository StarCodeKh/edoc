<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper over the Telegram Bot API sendMessage endpoint.
 *
 * Notifications must never break the request that triggered them, so every
 * failure here is logged and swallowed rather than thrown.
 */
class TelegramService
{
    private const ENDPOINT = 'https://api.telegram.org/bot%s/sendMessage';

    /** Telegram rejects messages longer than 4096 characters. */
    private const MAX_LENGTH = 4096;

    public function isConfigured(): bool
    {
        return filled(config('services.telegram.bot_token'))
            && filled(config('services.telegram.chat_id'));
    }

    /**
     * Deliver a message. Returns false when Telegram is unconfigured or the
     * call failed; the caller does not need to react either way.
     */
    public function send(string $message, ?string $chatId = null): bool
    {
        $token = config('services.telegram.bot_token');
        $chatId = $chatId ?: config('services.telegram.chat_id');

        if (blank($token) || blank($chatId)) {
            Log::debug('Telegram notification skipped: bot token or chat id is not configured.');

            return false;
        }

        $message = trim($message);
        if ($message === '') {
            return false;
        }

        if (mb_strlen($message) > self::MAX_LENGTH) {
            $message = mb_substr($message, 0, self::MAX_LENGTH - 1).'…';
        }

        try {
            $response = Http::timeout(10)
                ->retry(2, 200)
                ->asForm()
                ->post(sprintf(self::ENDPOINT, $token), [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::warning('Telegram notification failed.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Telegram notification threw an exception.', [
                'message' => $e->getMessage(),
            ]);
        }

        return false;
    }
}
