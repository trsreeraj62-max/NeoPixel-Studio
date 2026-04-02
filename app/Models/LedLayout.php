<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LedLayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id', 'name', 'type', 'settings'
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
