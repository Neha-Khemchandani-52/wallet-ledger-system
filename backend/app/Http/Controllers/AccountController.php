<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Support\Str;

class AccountController extends Controller
{
    /**
     * GET /accounts
     * List all accounts
     */
    public function index()
    {
        $accounts = Account::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $accounts->map(fn($a) => [
                'account_id' => $a->account_id,
                'name'       => $a->name ?? $a->account_id,
            ]),
        ]);
    }

    /**
     * POST /accounts
     * Create a new account
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_id' => [
                'required',
                'string',
                'max:50',
                'unique:accounts,account_id',
                'regex:/^(?=.*\d)[A-Za-z0-9]+$/',
            ],
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[A-Za-z\s\'\-]+$/',
            ],
            'opening_balance' => 'required|numeric|min:0',
        ],
        [
            'account_id.required' => 'Account ID is required',
            'account_id.regex' => 'Account ID must include at least one number and can contain letters (e.g., ACC001 or 12345)',
            'account_id.unique' => 'This account ID is already taken',
            'name.regex' => 'Please enter valid name!',
        ]);

        $account = Account::create([
            'account_id' => strtoupper($request->account_id),
            'name'       => $request->name ?? null,
        ]);

        if ($request->filled('opening_balance') && $request->opening_balance > 0) {
            LedgerEntry::create([
                'transaction_id' => (string) Str::uuid(),
                'account_id'     => strtoupper($request->account_id),
                'amount'         => (float) $request->opening_balance,
                'type'           => 'credit',
                'description'    => 'Opening balance',
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Account created successfully',
            'data'    => [
                'account_id' => $account->account_id,
                'name'       => $account->name ?? $account->account_id,
                'opening_balance' => (float) $request->opening_balance,
                'created_at' => $account->created_at,
            ],
        ], 201);
    }

    /**
     * GET /accounts/{accountId}/balance
     * Get derived balance from ledger
     */
    public function balance($accountId)
    {
        $account = Account::where('account_id', $accountId)->first();

        if (!$account) {
            return response()->json([
                'status'  => 'error',
                'message' => "Account '{$accountId}' not found",
            ], 404);
        }

        $balance = (float) LedgerEntry::where('account_id', $accountId)->sum('amount');

        return response()->json([
            'status'     => 'success',
            'account_id' => $accountId,
            'name'       => $account->name ?? $accountId,
            'balance'    => number_format($balance, 2, '.', ''),
            'currency'   => 'USD',
        ]);
    }

    public function deposit(Request $request, $accountId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $account = Account::where('account_id', $accountId)->first();

        if (!$account) {
            return response()->json([
                'status' => 'error',
                'message' => "Account not found"
            ], 404);
        }

        $transactionId = (string) Str::uuid();

        LedgerEntry::create([
            'transaction_id' => $transactionId,
            'account_id' => $accountId,
            'amount' => $request->amount,
            'type' => 'credit',
            'description' => 'Amount Deposited',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Amount deposited successfully',
        ]);
    }
    
}
