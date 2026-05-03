# AI Usage Disclosure

> As required by the assignment: full transparency on AI tool usage,
> prompts used, how AI helped, and my review/validation steps.

---

## Tools Used
ChatGPT & Claude.ai - UI design (CSS) guidance, Better UI/UX Feedback , Code Review, Detect Bugs & documentation support (README file)

---

## Prompts Used

> "I would like to add a deposit feature so users can add money to their wallet after creating an account. I have written the backend Laravel controller method. Where should I place the Add Money button in the React UI? What is the best UX position?"

> "Please look at my current frontend app developed in React Js PFA screenshot for ur reference. The button size, input box and design is not looking good, & also please help me to fix this UI CSS design for `create account modal popup`."

> "Please review my frontend code, & also frontend wesbite UI design,color,font. I have attached Wesbite UI screenshot for your reference & tell me if anything you think will be improved for better UI/UX as a UI/UX Designer point of view."

> "Please review my frontend code in React Js and backend code in PHP Laravel, and tell me if anything is wrong or if any issue, from a tester point of view."

> "Please help me to modify the attached README.md file in a  professional README.md file for my mini wallet ledger system interview assignment. I have already included all the steps which are mandatory for README, as you can see in attached README file,now assist me to strcure sections in a proper logical order an interviewer would read, trade-offs table formatting, project structure formatting."


---


## What AI Helped With 

### 1. Frontend UI/UX Design
- Suggested dark theme rationale
- Recommended DM Mono for financial figures, 
  Sora for UI copy
- Design for Button,card,dropdown,color & font
- Displaying user-frindly error messages & inline error/success 
- Suggested placement of "+ Add Money" inside 
  balance card as the most natural UX position

---

### 2. Code Review - Bug Detection
- Highlighted that `LedgerEntry::sum()` returns a string in PHP — suggested explicit `(float)` cast
- Pointed out the `|| parseFloat(txn.amount) > 0` bug causing all transactions to show as Credit

---

### 3. Documentation Support
- Structured the README sections in a logical order 
- Suggested Proper formatting and alignment
- Wrote the trade-offs table format

---

## What I Wrote and Validated Myself

- All production PHP code (Controllers, Service, Models, Middleware, Migrations)
- All React components (AccountSelector, BalanceDisplay, TransferForm, TransactionList, CreateAccountModal, DepositModal)
- Database schema design decisions
- Transfer atomicity logic with `DB::transaction()` and `lockForUpdate()`
- Idempotency implementation at both DB constraint level and application level
- Opening balance ledger entry on account creation
- Deposit feature (backend controller method + frontend modal)
- All API route definitions and middleware configuration
- React Query for data fetching with automatic cache invalidation
- client-side UUID generation for idempotency keys before API calls
- Ledger-based balance pattern (deriving balance from `SUM(amount)` instead of storing it)
- Database schema decisions (`DECIMAL(19,4)` vs `FLOAT`, unique constraint for idempotency)
- Consistent lock ordering (`sort()` before `lockForUpdate()`) to prevent A→B vs B→A deadlocks
- Added the seeded test accounts
- Drafted the design decisions explanations in clear technical language in README file
- All actual technical content — command sequences, API request/response examples, file paths
- Verified every setup command works on my machine before including in README



---

## My Validation Steps

- Manually tested all 5 API endpoints via Postman
- Verified atomic rollback by throwing an exception mid-transaction — confirmed debit entry was rolled back
-  Tested duplicate `transaction_id` — confirmed 409 response, no duplicate ledger entries created
-  Tested concurrent transfer scenario — confirmed `lockForUpdate()` prevents race condition
-  Verified balance always equals `SUM(amount)` from ledger after multiple transfers and deposits
-  Tested all edge cases: zero amount, negative amount, self-transfer, insufficient funds, non-existent account
-  Verified frontend error states, loading states, and success messages across all components


---

## Summary

AI was used as a UI/UX designer, code reviewer & bug detector. All code, architecture decisions, implementations, and validations were made and tested by me.