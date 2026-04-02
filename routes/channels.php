<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('device.{deviceId}', function ($user, $deviceId) {
    // Check if the user owns the device
    return $user->devices()->where('id', $deviceId)->exists();
});
