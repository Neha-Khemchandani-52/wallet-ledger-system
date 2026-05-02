<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        LedgerEntry::query()->delete();
        Account::query()->delete();

        // Create 3 test accounts
        $accounts = [
            ['account_id' => 'ACC001', 'name' => 'Jennifer Winget'],
            ['account_id' => 'ACC002', 'name' => 'Bob Smith'],
            ['account_id' => 'ACC003', 'name' => 'Charlie Davis'],
            ['account_id' => 'ACC004', 'name' => 'Alice Johnson'],
            ['account_id' => 'ACC005', 'name' => 'Neha K']
        ];

        foreach ($accounts as $acc) {
            Account::create($acc);
        }

        // Give each account an opening balance via ledger entries
        $openingEntries = [
            ['account_id' => 'ACC001', 'amount' => 5000.00],
            ['account_id' => 'ACC002', 'amount' => 3000.00],
            ['account_id' => 'ACC003', 'amount' => 1500.00],
            ['account_id' => 'ACC004', 'amount' => 2500.00],
            ['account_id' => 'ACC005', 'amount' => 2000.00]

        ];

        foreach ($openingEntries as $entry) {
            LedgerEntry::create([
                'transaction_id' => (string) Str::uuid(),
                'account_id'     => $entry['account_id'],
                'amount'         => $entry['amount'],
                'type'           => 'credit',
                'description'    => 'Opening balance',
            ]);
        }
    }
}
