import test from 'ava'

import {
    Account,
    Keypair,
    Memo,
    Networks,
    Transaction,
    TransactionBuilder,
    Operation,
    hash
} from 'stellar-sdk';

import { decodeTransactionMemo, encodeMemo } from '../src';

async function runCodec(memo: Memo): Promise<Memo> {
    const keys1 = Keypair.random();
    const keys2 = Keypair.random();
    const user1 = keys1.publicKey();
    const user2 = keys2.publicKey();

    const account = new Account(user1, '0');
    const secret = await encodeMemo(account.sequenceNumber(), keys1, user2, memo);
    const builder = new TransactionBuilder(account, {
        networkPassphrase: Networks.PUBLIC,
        fee: 1000,
    });
    builder.addOperation(Operation.bumpSequence({
        bumpTo: '0'
    }));
    builder.setTimeout(0);
    builder.addMemo(secret);
    const tx = builder.build();

    const xdr = tx.toXDR();
    const tx2 = new Transaction(xdr, Networks.PUBLIC);
    return decodeTransactionMemo(tx2, keys2);
}

test('Memo.id', async (t) => {
    const memo = Memo.id('234614657');
    const memo2 = await runCodec(memo);
    t.true(memo.value === memo2.value);
});

test('Memo.text', async (t) => {
    const memo = Memo.text('jshfjgysfhbsaxh');
    const memo2 = await runCodec(memo);
    t.true(Buffer.from(memo.value as string).equals(memo2.value as Buffer));
});

test('Memo.hash', async (t) => {
    const hexHash = hash(Buffer.from('test test test')).toString('hex');
    const memo = Memo.hash(hexHash);
    const memo2 = await runCodec(memo);
    t.true((memo.value as Buffer).equals(memo2.value as Buffer));
});
