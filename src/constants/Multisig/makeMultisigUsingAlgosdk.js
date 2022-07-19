import { AccountI, AccountII , AccountIII} from "./Account.js";
import algosdk from "algosdk";
import * as fs from "fs";


const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const algodServer = 'http://localhost';
const algodPort = 4001;
let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);    

async function showBalance() {
    let accountInfoI = await algodClient.accountInformation(AccountI.addr).do();
    console.log("Account balance 1: %d microAlgos", accountInfoI.amount);

    let accountInfoII = await algodClient.accountInformation(AccountII.addr).do();
    console.log("Account balance 2: %d microAlgos", accountInfoII.amount);

    let accountInfoIII = await algodClient.accountInformation(AccountIII.addr).do();
    console.log("Account balance 3: %d microAlgos", accountInfoIII.amount);
}

function createMultisigWithSk(txn, sk, mparams) {
    let nx = txn.signTxn(sk);
    let tmp_nx = algosdk.decodeObj(nx);
    let subsig = mparams.addrs.map((x) => {
        if (x == algosdk.encodeAddress(tmp_nx.sgnr)) {
            return {
                pk: algosdk.decodeAddress(x).publicKey,
                s: tmp_nx.sig,
            }
        }
        return {
            pk: algosdk.decodeAddress(x).publicKey,
        }
    });
    tmp_nx.msig = {
        subsig: subsig,
        thr: mparams.threshold,
        v: mparams.version,
    };
    
    delete tmp_nx.sgnr;
    delete tmp_nx.sig;
    return tmp_nx;
}

async function createMul() {
    const mparams = {
        version: 1,
        threshold: 2,
        addrs: [
            AccountI.addr,
            AccountII.addr,
            AccountIII.addr,
        ],
    };

    var multisigaddr = algosdk.multisigAddress(mparams);
    console.log("Multisig Address: " + multisigaddr);
}

async function Execute() {
    const mparams = {
        version: 1,
        threshold: 2,
        addrs: [
            AccountI.addr,
            AccountII.addr,
            AccountIII.addr,
        ],
    };

    var multisigaddr = algosdk.multisigAddress(mparams);
    console.log("Multisig Address: " + multisigaddr);

    let params = await algodClient.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    const receiver = AccountIII.addr;
    let names = '{"firstName": "John", "lastName":"Doe"}';
    const enc = new TextEncoder();
    const note = enc.encode(names);
    let txn = algosdk.makePaymentTxnWithSuggestedParams(multisigaddr, receiver, 100000, undefined, note, params);

    
    //Multisig transaction using signMultisigTransaction one signature signed
    let rawSignedTxn = algosdk.signMultisigTransaction(txn, mparams, AccountI.sk);
    fs.writeFileSync("PayMultisig1.txn", Buffer.from(rawSignedTxn.blob).toString("base64"));
    let obMul = algosdk.decodeObj(rawSignedTxn.blob);
    fs.writeFileSync("JsonMultisig1.txn", JSON.stringify(obMul, null, 4));
    
    let rawSigned2Txn = algosdk.appendSignMultisigTransaction(rawSignedTxn.blob, mparams, AccountIII.sk);
    fs.writeFileSync("PayMultisig2.txn", Buffer.from(rawSigned2Txn.blob).toString("base64"));
    let obMul2Sig = algosdk.decodeObj(rawSigned2Txn.blob);
    fs.writeFileSync("JsonMultisig2.txn", JSON.stringify(obMul2Sig, null, 4));
    

    //Multisig transaction using basic Algosdk signTxn
    let AccountIMultisig = createMultisigWithSk(txn, AccountI.sk, mparams);
    //console.log(AccountIMultisig);
    let createBlobMultisigI = algosdk.encodeObj(AccountIMultisig);
    fs.writeFileSync("BasicMultisig.txn", Buffer.from(createBlobMultisigI).toString("base64"));
    fs.writeFileSync("MultiTransactionWithNormalSigned.txn", JSON.stringify(AccountIMultisig, null, 4));
    //Data in PayMultisig1.txn is identical to data in BasicMultisig.txn

    let AccountIIIMultisig = createMultisigWithSk(txn, AccountIII.sk, mparams);
    let createBlobMultisigIII = algosdk.encodeObj(AccountIIIMultisig);

    let combinedBasicMultisig = algosdk.mergeMultisigTransactions([createBlobMultisigI, createBlobMultisigIII]);
    fs.writeFileSync("BasicMultisigCombined.txn", Buffer.from(combinedBasicMultisig).toString("base64"));
    fs.writeFileSync("BasicFinishedMultisig.txn", JSON.stringify(algosdk.decodeObj(combinedBasicMultisig), null, 4));
    
    await algodClient.sendRawTransaction(combinedBasicMultisig).do();
    console.log("Complete!");
}

Execute();
