<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();

            $table->string('transaction_id'); // idempotency key
            $table->string('account_id');

            $table->decimal('amount', 19, 4); // credit, debit
            $table->enum('type', ['credit', 'debit']);

            $table->string('description')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Idempotency constraint
            $table->unique(['transaction_id', 'account_id']);

            // Performance index
            $table->index(['account_id', 'created_at']);

            // Foreign key
            $table->foreign('account_id')
                ->references('account_id')
                ->on('accounts')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
