<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceState extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id', 'current_state', 'is_offline'
    ];

    protected $casts = [
        'current_state' => 'array',
        'is_offline' => 'boolean',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
