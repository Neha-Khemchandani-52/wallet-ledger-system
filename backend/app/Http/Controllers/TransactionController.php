<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\LedgerEntry;

class TransactionController extends Controller
{
    /**
     * GET /accounts/{accountId}/transactions
     * Paginated transaction history
    */
    public function index(Request $request, $accountId)
    {
        $account = Account::where('account_id', $accountId)->first();

        if (!$account) {
            return response()->json([
                'status'  => 'error',
                'message' => "Account '{$accountId}' not found",
            ], 404);
        }

        $perPage = min((int) $request->get('per_page', 10), 100); // cap at 100

        $transactions = LedgerEntry::where('account_id', $accountId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $formatted = $transactions->map(fn($txn) => [
            'id'             => $txn->id,
            'transaction_id' => $txn->transaction_id,
            'type'           => $txn->type,         // 'credit' or 'debit'
            'amount'         => number_format(abs((float)$txn->amount), 2, '.', ''),
            'description'    => $txn->description,
            'created_at'     => $txn->created_at,
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => $formatted,
            'meta'   => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

}
