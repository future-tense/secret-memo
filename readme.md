# @futuretense/secret-memo

Create secret transaction memos using public-key encryption.

## Installation

    npm install @futuretense/secret-memo

## Usage

### Creating an encrypted memo
``` typescript
import { encodeMemo } from '@futuretense/secret-memo';

...

const memo = Memo.id('1543624365');

const account = await server.loadAccount(user1);
const secret = await encodeMemo(account.sequenceNumber(), keys1, user2, memo);
const builder = new TransactionBuilder(account, {
    networkPassphrase: Networks.PUBLIC,
    fee: 1000,
});

...

builder.setTimeout(0);
builder.addMemo(secret);
const tx = builder.build();

const xdr = tx.toXDR();
```

### Decoding a memo from a transaction
``` typescript
import { decodeTransactionMemo } from '@futuretense/secret-memo';

const tx = new Transaction(xdr, Networks.PUBLIC);
const memo = await decodeTransactionMemo(tx, keys2);
```

Copyright &copy; 2020 Future Tense, LLC
