<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    protected $table = 'ledger_entries';

    public $timestamps = false; // manually handling created_at

    protected $fillable = [
        'transaction_id',
        'account_id',
        'amount',
        'type',
        'description',
        'created_at',
    ];

    /**
     * Relationship: Ledger entry belongs to account
     */
    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id', 'account_id');
    }
}
