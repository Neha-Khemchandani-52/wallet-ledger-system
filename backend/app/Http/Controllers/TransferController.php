<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TransferAmountService;
use Exception;

class TransferController extends Controller
{
    public function __construct(protected TransferAmountService $transferService) {}

    /**
     * POST /transfers
     * Atomic, idempotent money transfer
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'from_account_id' => 'required|string',
            'to_account_id'   => 'required|string|different:from_account_id',
            'amount'          => 'required|numeric|min:0.01|decimal:0,2', // max 2 decimal places
            'transaction_id'  => 'required|string|max:100',
        ]);

        try {
            $result = $this->transferService->transfer(
                $request->from_account_id,
                $request->to_account_id,
                (float) $request->amount,
                $request->transaction_id,
            );

            if ($result['status'] === 'duplicate') {
                return response()->json([
                    'status'  => 'duplicate',
                    'message' => 'This transaction was already processed',
                ], 409);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Transfer completed successfully',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
