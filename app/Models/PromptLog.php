<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromptLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'prompt', 'response_json', 'status'
    ];

    protected $casts = [
        'response_json' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
