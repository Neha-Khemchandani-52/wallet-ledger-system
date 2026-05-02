<?php

namespace App\Services;

use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Support\Facades\DB;
use Exception;

class TransferAmountService
{
    public function transfer(string $fromAccountId, string $toAccountId, float $amount, string $transactionId): array
    {
        return DB::transaction(function () use ($fromAccountId, $toAccountId, $amount, $transactionId) {

            // 1. Idempotency check first
            if (LedgerEntry::where('transaction_id', $transactionId)->exists()) {
                return ['status' => 'duplicate', 'message' => 'Transaction already processed'];
            }

            // 2. Lock in sorted order — prevents A To B vs B To A deadlock
            $sortedIds = collect([$fromAccountId, $toAccountId])->sort()->values()->all();
            $accounts  = Account::whereIn('account_id', $sortedIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('account_id');

            if ($accounts->count() !== 2) {
                throw new Exception('Invalid account details.Please make sure that both Account IDs must be registered!');
            }

            // 3. Amount validation (belt-and-suspenders, FormRequest already validates)
            if ($amount <= 0) {
                throw new Exception('Amount must be greater than zero');
            }

            // 4. Balance check — cast to float, sum() returns string
            $balance = (float) LedgerEntry::where('account_id', $fromAccountId)->sum('amount');

            if ($balance < $amount) {
                throw new Exception(
                    "Insufficient funds: available " . number_format($balance, 2) . ", requested " . number_format($amount, 2)
                );
            }

            // 5. Atomic insert — both entries or neither
            LedgerEntry::insert([
                [
                    'transaction_id' => $transactionId,
                    'account_id'     => $fromAccountId,
                    'amount'         => -$amount,
                    'type'           => 'debit',
                    'description'    => "Transfer to {$toAccountId}",
                    'created_at'     => now(),
                ],
                [
                    'transaction_id' => $transactionId,
                    'account_id'     => $toAccountId,
                    'amount'         => +$amount,
                    'type'           => 'credit',
                    'description'    => "Transfer from {$fromAccountId}",
                    'created_at'     => now(),
                ],
            ]);

            return ['status' => 'success'];
        });
    }
}