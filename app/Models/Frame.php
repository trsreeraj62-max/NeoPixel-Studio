<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Frame extends Model
{
    use HasFactory;

    protected $fillable = [
        'animation_id', 'order', 'duration', 'data'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function animation()
    {
        return $this->belongsTo(Animation::class);
    }
}
