<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $table = 'accounts';

    protected $fillable = [
        'account_id',
        'name'
    ];

    /**
     * Relationship: One account has many ledger entries
     */
    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class, 'account_id', 'account_id');
    }
}
