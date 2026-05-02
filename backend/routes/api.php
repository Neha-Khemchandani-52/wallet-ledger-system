<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransferController;

Route::prefix('v1')->middleware(['api.token', 'throttle:60,1'])->group(function () {
    Route::get('/accounts',                          [AccountController::class, 'index']);
    Route::post('/accounts',                         [AccountController::class, 'store']);
    Route::get('/accounts/{accountId}/balance',      [AccountController::class, 'balance']);
    Route::get('/accounts/{accountId}/transactions', [TransactionController::class, 'index']);
    Route::post('/transfers',                        [TransferController::class, 'transfer']);
    Route::post('/accounts/{accountId}/deposit',     [AccountController::class, 'deposit']);
});