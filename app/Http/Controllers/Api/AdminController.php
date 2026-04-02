<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Device;
use App\Models\Animation;
use App\Models\PromptLog;
use App\Models\DeviceLog;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats() { return response()->json([ 'users' => User::count(), 'devices' => Device::count(), 'animations' => Animation::count(), 'online' => Device::where('status','online')->count() ]); }
    public function users() { return response()->json(User::select('id','name','email','role','created_at')->get()); }
    public function updateUser(Request $request, User $user) { $v = $request->validate([ 'name' => 'sometimes|string', 'email' => 'sometimes|email|unique:users,email,'.$user->id, 'role' => 'sometimes|in:admin,user' ]); $user->update($v); return response()->json($user); }
    public function deleteUser(User $user) { $user->delete(); return response()->json(['message' => 'User deleted']); }
    public function devices() { return response()->json(Device::with('user:id,name')->get()); }
    public function deviceLogs() { return response()->json(DeviceLog::with('device:id,name')->latest()->take(100)->get()); }
    public function promptLogs() { return response()->json(PromptLog::with('user:id,name')->latest()->take(100)->get()); }
}
