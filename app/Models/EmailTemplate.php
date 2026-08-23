<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A notification message template.
 *
 * Despite the table name this covers every delivery channel — `channel` says
 * which one a row belongs to ('email' or 'telegram'). Bodies live in `html`
 * and use {placeholder} tokens that the notification classes substitute.
 */
class EmailTemplate extends Model
{
    use HasFactory;

    protected $table = 'email_templates';

    public $timestamps = false;

    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_TELEGRAM = 'telegram';

    public const CHANNELS = [self::CHANNEL_EMAIL, self::CHANNEL_TELEGRAM];

    public function scopeFilter($query, array $filters){
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%');
            });
        });

        $query->when($filters['channel'] ?? null, function ($query, $channel) {
            if (in_array($channel, self::CHANNELS, true)) {
                $query->where('channel', $channel);
            }
        });
    }

    public function scopeChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Render a template body, falling back to $fallback when the row is
     * missing or empty. {app_name} and {sent_at} are always available.
     */
    public static function render(string $slug, string $channel, array $replacements, string $fallback = ''): string
    {
        $replacements += [
            '{app_name}' => config('app.name'),
            '{sent_at}' => now()->format('M d, Y g:i A'),
        ];

        $template = static::where('slug', $slug)->where('channel', $channel)->first();
        $body = $template && filled($template->html) ? $template->html : $fallback;

        return trim(strtr($body, $replacements));
    }
}
