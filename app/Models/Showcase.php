<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Showcase extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        // Paths starting with "/" are bundled files in public/ (the dummy photos), the rest are uploads.
        return str_starts_with($this->image_path, '/') ? $this->image_path : Storage::disk('public')->url($this->image_path);
    }
}
