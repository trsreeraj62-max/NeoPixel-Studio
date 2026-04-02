<?php

namespace App\Http\Controllers;

use App\Models\PendingCommand;
use App\Http\Requests\StorePendingCommandRequest;
use App\Http\Requests\UpdatePendingCommandRequest;

class PendingCommandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePendingCommandRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PendingCommand $pendingCommand)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PendingCommand $pendingCommand)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePendingCommandRequest $request, PendingCommand $pendingCommand)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PendingCommand $pendingCommand)
    {
        //
    }
}
