<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animation;
use Illuminate\Http\Request;

class AnimationController extends Controller
{
    public function index(Request $request) { return response()->json($request->user()->animations()->with('frames')->get()); }
    public function store(Request $request) {
        $v = $request->validate([ 'name' => 'required|string', 'fps' => 'integer', 'loop' => 'boolean', 'frames' => 'array' ]);
        $animation = $request->user()->animations()->create([ 'name' => $v['name'], 'fps' => $v['fps'] ?? 30, 'loop' => $v['loop'] ?? true ]);
        if (isset($v['frames'])) {
            foreach ($v['frames'] as $frame) {
                $animation->frames()->create([ 'order' => $frame['order'], 'duration' => $frame['duration'] ?? 100, 'data' => $frame['data'] ]);
            }
        }
        return response()->json($animation->load('frames'), 201);
    }
    public function show(Animation $animation) { return response()->json($animation->load('frames')); }
}
