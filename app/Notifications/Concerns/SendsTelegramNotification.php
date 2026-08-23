<?php

namespace App\Notifications\Concerns;

use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Services\TelegramService;

/**
 * Shared plumbing for pushing a notification to Telegram.
 *
 * Mirrors how the Slack notifications work: one message per event rather than
 * one per recipient, gated on the per-type toggles in Settings.
 */
trait SendsTelegramNotification
{
    /**
     * Render the '{$type}' Telegram template and send it, provided the type is
     * enabled for Telegram in the notification settings.
     */
    protected function dispatchTelegram(string $type, array $replacements, string $fallback = ''): bool
    {
        $setting = NotificationSetting::where('type', $type)->first();

        if (!$setting || !$setting->telegram_is_active || !$setting->can_be_telegrammed) {
            return false;
        }

        $message = EmailTemplate::render($type, EmailTemplate::CHANNEL_TELEGRAM, $replacements, $fallback);

        if ($message === '') {
            return false;
        }

        return app(TelegramService::class)->send($message);
    }

    /**
     * Telegram only accepts a small HTML subset, so anything interpolated into
     * a template has to have its markup stripped and its entities escaped.
     */
    protected function telegramSafe(?string $value, int $limit = 0): string
    {
        $clean = trim(strip_tags((string) $value));

        if ($limit > 0 && mb_strlen($clean) > $limit) {
            $clean = mb_substr($clean, 0, $limit) . '…';
        }

        return htmlspecialchars($clean, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
