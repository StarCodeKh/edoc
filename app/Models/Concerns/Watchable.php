<?php
namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait Watchable
{
    /**
     * Get all of the users that are watching this model.
     */
    public function watchers(): MorphToMany
    {
        return $this->morphToMany(User::class, 'watchable', 'watchers');
    }
}
