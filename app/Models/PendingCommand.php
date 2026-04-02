<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingCommand extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id', 'command', 'status', 'retries'
    ];

    protected $casts = [
        'command' => 'array',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
