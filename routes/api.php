<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\UserSettingController;
use App\Http\Controllers\Api\AnimationController;

// ─── Auth ────────────────────────────────────────────────────────────────────
Route::post('/register', function (Request $request) {
    $v = $request->validate([ 'name' => 'required|string|max:255', 'email' => 'required|string|email|unique:users', 'password' => 'required|string|min:8' ]);
    $user = User::create([ 'name' => $v['name'], 'email' => $v['email'], 'password' => Hash::make($v['password']), 'role' => 'user' ]);
    return response()->json([ 'token' => $user->createToken('auth_token')->plainTextToken, 'user' => $user ]);
});

Route::post('/login', function (Request $request) {
    $v = $request->validate(['email' => 'required|email', 'password' => 'required']);
    $user = User::where('email', $v['email'])->first();
    if (!$user || !Hash::check($v['password'], $user->password)) throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
    return response()->json([ 'token' => $user->createToken('auth_token')->plainTextToken, 'user' => $user ]);
});

// ─── Device Sync (public) ───────────────────────────────────────────────────
Route::get('/devices/{device}/sync', [DeviceController::class, 'sync']);

// ─── Protected Routes ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $r) => $r->user());
    Route::post('/logout', function (Request $r) { $r->user()->currentAccessToken()->delete(); return response()->json(['message' => 'Logged out']); });

    Route::apiResource('devices', DeviceController::class);
    Route::post('/devices/{device}/control', [DeviceController::class, 'control']);
    Route::post('/devices/{device}/prompt',  [DeviceController::class, 'prompt']);
    Route::post('/prompt',                   [DeviceController::class, 'promptGeneric']);

    Route::apiResource('animations',         AnimationController::class);

    Route::get('/settings/theme',                     [UserSettingController::class, 'getTheme']);
    Route::post('/settings/theme',                    [UserSettingController::class, 'setTheme']);
    Route::get('/notifications',                      [UserSettingController::class, 'notifications']);
    Route::patch('/notifications/{notification}/read',[UserSettingController::class, 'markRead']);

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats',          [AdminController::class, 'stats']);
        Route::get('/users',          [AdminController::class, 'users']);
        Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}',[AdminController::class, 'deleteUser']);
        Route::get('/devices',        [AdminController::class, 'devices']);
        Route::get('/logs/devices',   [AdminController::class, 'deviceLogs']);
        Route::get('/logs/prompts',   [AdminController::class, 'promptLogs']);
    });
});
