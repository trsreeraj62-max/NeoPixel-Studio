<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'setting_key', 'setting_value'
    ];

    protected $casts = [
        'setting_value' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
