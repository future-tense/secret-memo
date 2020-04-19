
import { encrypt, decrypt } from '@futuretense/stellar-box';
import Long from 'long';

import {
    Keypair,
    Memo,
    Transaction,
    MemoID,
    MemoHash,
    MemoReturn,
    MemoText,
} from 'stellar-sdk';

/**
 * @internal
 */
type codecFunction = typeof encrypt;

/**
 * @internal
 */
const padding = Buffer.alloc(8);

/**
 * @internal
 * @param fn
 * @param sequenceNumber
 * @param keys
 * @param to
 * @param memo
 */
async function work(
    fn: codecFunction,
    sequenceNumber: string,
    keys: Keypair,
    to: string,
    memo: Memo
): Promise<Memo> {

    if (!memo.value) {
        throw new Error('Invalid memo value');
    }

    const seqNum = Long.fromString(sequenceNumber);
    const nonce = Buffer.concat([
        padding,
        Buffer.from(seqNum.mul(2).toBytesBE())
    ]);

    if (memo.type === MemoText) {
        const data = Buffer.from(memo.value);
        const res = await fn(keys, to, data, nonce, false);
        const value = Buffer.from(res)
        return new Memo(memo.type, value);
    }

    else if (memo.type === MemoID) {
        const data = Buffer.from(Long.fromString(<string>memo.value, true).toBytesBE());
        const res = await fn(keys, to, data, nonce, false);
        const value = Long.fromBytesBE(res, true).toString();
        return new Memo(memo.type, value);
    }

    else if ((memo.type === MemoHash) || (memo.type === MemoReturn)) {
        const data = <Buffer>memo.value;
        const res = await fn(keys, to, data, nonce, false);
        const value = Buffer.from(res);
        return new Memo(memo.type, value);
    }

    else {
        throw new Error('Invalid memo type');
    }
}

/**
 *
 * @param sequenceNumber -
 * @param keys -
 * @param to -
 * @param memo -
 */
export function encodeMemo(
    sequenceNumber: string,
    keys: Keypair,
    to: string,
    memo: Memo
): Promise<Memo> {
    const sequence = Long.fromString(sequenceNumber).add(1).toString();
    return work(encrypt, sequence, keys, to, memo);
}

/**
 *
 * @param sequenceNumber -
 * @param keys -
 * @param from -
 * @param memo -
 */
export function decodeMemo(
    sequenceNumber: string,
    keys: Keypair,
    from: string,
    memo: Memo
): Promise<Memo> {
    return work(decrypt, sequenceNumber, keys, from, memo);
}

/**
 *
 * @param tx -
 * @param keys -
 */
export function decodeTransactionMemo(
    tx: Transaction,
    keys: Keypair
): Promise<Memo> {
    return work(decrypt, tx.sequence, keys, tx.source, tx.memo);
}