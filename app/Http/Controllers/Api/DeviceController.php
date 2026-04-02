<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\DeviceLog;
use App\Models\DeviceState;
use App\Models\PendingCommand;
use App\Events\DeviceCommandSent;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request) { return response()->json($request->user()->devices); }
    public function store(Request $request) {
        $v = $request->validate([ 'name' => 'required|string|max:100', 'type' => 'required|string', 'connection_type' => 'required|string' ]);
        $device = $request->user()->devices()->create($v);
        DeviceState::create(['device_id' => $device->id, 'current_state' => [], 'is_offline' => true]);
        return response()->json($device, 201);
    }
    public function show(Device $device) { return response()->json($device->load('ledLayouts')); }
    public function update(Request $request, Device $device) {
        $v = $request->validate([ 'name' => 'sometimes|string|max:100', 'type' => 'sometimes|string', 'connection_type' => 'sometimes|string', 'status' => 'sometimes|in:online,offline' ]);
        $device->update($v); return response()->json($device);
    }
    public function destroy(Device $device) { $device->delete(); return response()->json(['message' => 'Device deleted']); }
    public function control(Request $request, Device $device) {
        $v = $request->validate(['command' => 'required|array']);
        DeviceState::updateOrCreate(['device_id' => $device->id], ['current_state' => $v['command'], 'is_offline' => $device->status !== 'online']);
        if ($device->status === 'online') broadcast(new DeviceCommandSent($device, $v['command']))->toOthers();
        PendingCommand::create(['device_id' => $device->id, 'command' => $v['command'], 'status' => $device->status === 'online' ? 'sent' : 'pending']);
        DeviceLog::create(['device_id' => $device->id, 'event' => 'command_sent', 'details' => json_encode($v['command'])]);
        return response()->json(['message' => 'Command broadcast successfully']);
    }

    public function prompt(Request $request, Device $device) {
        $v = $request->validate(['prompt' => 'required|string']);
        $animation = $this->parsePromptToAnimation(strtolower($v['prompt']));
        \App\Models\PromptLog::create(['user_id' => $request->user()->id, 'prompt' => $v['prompt'], 'response_json' => $animation, 'status' => 'success']);
        return response()->json(['message' => 'Prompt processed', 'animation' => $animation]);
    }

    private function parsePromptToAnimation(string $prompt): array {
        $frames = [];
        if (str_contains($prompt, 'rainbow')) {
            $colors = ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#9400d3'];
            for ($f = 0; $f < 7; $f++) { $data = []; for ($i = 0; $i < 64; $i++) $data[] = $colors[($i + $f) % 7]; $frames[] = ['order' => $f + 1, 'duration' => 120, 'data' => $data]; }
        } elseif (str_contains($prompt, 'fire')) {
            $fireColors = ['#ff0000','#ff4500','#ff6600','#ff2200','#ff8800','#000000','#ff1100'];
            for ($f = 0; $f < 5; $f++) { $data = array_map(fn() => $fireColors[array_rand($fireColors)], range(0, 63)); $frames[] = ['order' => $f + 1, 'duration' => 80, 'data' => $data]; }
        } elseif (str_contains($prompt, 'wave')) {
            for ($f = 0; $f < 8; $f++) { $data = array_fill(0, 64, '#000000'); for ($col = 0; $col < 8; $col++) { $row = (int) round(3.5 + 3 * sin(($col + $f) * M_PI / 4)); $row = max(0, min(7, $row)); $data[$row * 8 + $col] = '#00bfff'; } $frames[] = ['order' => $f + 1, 'duration' => 100, 'data' => $data]; }
        } elseif (str_contains($prompt, 'sparkle')) {
            for ($f = 0; $f < 6; $f++) { $data = array_fill(0, 64, '#000000'); foreach (array_rand(array_fill(0, 64, 0), 10) as $idx) $data[$idx] = '#ffffff'; $frames[] = ['order' => $f + 1, 'duration' => 150, 'data' => $data]; }
        } elseif (str_contains($prompt, 'pulse')) {
            $pulseColors = ['#ff0000','#cc0000','#990000','#660000','#330000','#660000','#990000','#cc0000'];
            for ($f = 0; $f < 8; $f++) $frames[] = ['order' => $f + 1, 'duration' => 100, 'data' => array_fill(0, 64, $pulseColors[$f])];
        } elseif (str_contains($prompt, 'chase')) {
            for ($f = 0; $f < 8; $f++) { $data = array_fill(0, 64, '#000000'); for ($i = 0; $i < 8; $i++) $data[($f + $i * 8) % 64] = '#ffff00'; $frames[] = ['order' => $f + 1, 'duration' => 100, 'data' => $data]; }
        } else {
            for ($f = 0; $f < 4; $f++) { $data = array_map(fn() => rand(0,1) ? '#'.dechex(rand(0,0xffffff)) : '#000000', range(0,63)); $frames[] = ['order' => $f + 1, 'duration' => 120, 'data' => $data]; }
        }
        return ['frames' => $frames, 'fps' => 10, 'loop' => true];
    }

    public function sync(Device $device) {
        $commands = PendingCommand::where('device_id', $device->id)->where('status', 'pending')->get();
        foreach ($commands as $cmd) $cmd->update(['status' => 'sent']);
        $device->update(['status' => 'online', 'last_seen' => now()]);
        DeviceState::updateOrCreate(['device_id' => $device->id], ['is_offline' => false]);
        DeviceLog::create(['device_id' => $device->id, 'event' => 'reconnected', 'details' => 'Device synced ' . $commands->count() . ' pending commands']);
        return response()->json(['device' => $device, 'commands' => $commands, 'synced' => $commands->count()]);
    }
}
