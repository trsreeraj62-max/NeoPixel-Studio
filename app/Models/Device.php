<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'type', 'connection_type', 'status', 'last_seen'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ledLayouts()
    {
        return $this->hasMany(LedLayout::class);
    }
}
