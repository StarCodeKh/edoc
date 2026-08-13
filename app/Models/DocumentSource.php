<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentSource extends Model
{
    use HasFactory;

    protected $fillable = ['parent_id', 'name', 'order'];

    public function parent()
    {
        return $this->belongsTo(DocumentSource::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DocumentSource::class, 'parent_id')->orderBy('order');
    }

    public function scopeDepartments($query)
    {
        return $query->whereNull('parent_id')->orderBy('order');
    }
}
