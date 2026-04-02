<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use App\Models\Notification;
use Illuminate\Http\Request;

class UserSettingController extends Controller
{
    public function getTheme(Request $request)
    {
        $setting = UserSetting::where('user_id', $request->user()->id)
            ->where('setting_key', 'theme')
            ->first();
        return response()->json(['theme' => $setting ? $setting->setting_value['value'] : 'light']);
    }

    public function setTheme(Request $request)
    {
        $request->validate(['theme' => 'required|in:light,dark']);
        UserSetting::updateOrCreate(
            ['user_id' => $request->user()->id, 'setting_key' => 'theme'],
            ['setting_value' => ['value' => $request->theme]]
        );
        return response()->json(['theme' => $request->theme]);
    }

    public function notifications(Request $request)
    {
        return response()->json(
            Notification::where('user_id', $request->user()->id)->latest()->take(20)->get()
        );
    }

    public function markRead(Request $request, Notification $notification)
    {
        $notification->update(['read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }
}
