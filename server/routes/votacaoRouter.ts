import * as fs from 'fs';
import { join } from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import * as logger from 'logops';
var Web3 = require('web3');
//import { default as Web3 } from 'web3';
//import { default as Web3 } from 'web3';
//import { default as solc } from 'solc';
var solc = require('solc');
//import { default as solc } from 'solc';
// import { default as Web3 } from 'web3';
// import { default as solc } from 'solc';

export const votacaoRouter: Router = Router();

//let provider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8549"));
// logger.info('provider: ', provider);
// let web3 = new Web3(provider);
logger.info('web3: ', web3);

//let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

logger.info('accounts: ');
web3.eth.getAccounts().then(console.log);

let contractFile = join(__dirname, '../../../contracts/Votacao.sol');
logger.info('contractFile: ', contractFile);

//let code = fs.readFileSync('Votacao.sol').toString();
let code = fs.readFileSync(contractFile).toString();
logger.info('code: ', code);
let compiledCode = solc.compile(code);
logger.info('compiledCode: ', compiledCode);

let abiDefinition = JSON.parse(compiledCode.contracts[':Votacao'].interface)
logger.info('abiDefinition: ', abiDefinition);
let VotacaoContract = new web3.eth.Contract(abiDefinition);
logger.info('VotacaoContract: ', VotacaoContract);
let byteCode = compiledCode.contracts[':Votacao'].bytecode;
//Correção de bug da ferramenta
byteCode = '0x' + byteCode;
logger.info('compiledCode com prefixo: ', byteCode);

// logger.info('tx.gasprice: ', tx.gasprice);
// logger.info('msg.gas: ', msg.gas);

//TODO:Substituir
//let deployedContract = VotacaoContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
//TODO: POR esse expmlo de https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy

let transactionHashContrato;
let enderecoContrato;

VotacaoContract.options.data = byteCode;

votacaoRouter.get("/deploy", function (request: Request, response: Response, next: NextFunction) {

    try {

        VotacaoContract.deploy()
            // .estimateGas(function (err, gas) {
            //         console.log('estimateGas: ', gas);//  338688
            //     });
            .send({
                from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34',
                gas: 323481
                //gasPrice: '1000000',
            })
            .on('error', function (error) {
                console.log('Erro ao fazer o deploy do contrato.')
                throw error;
            })
            .on('transactionHash', function (transactionHash) {
                console.log('Contrato Criado - transactionHash: ', transactionHash);
                transactionHashContrato = transactionHash;
            })
            .then(function (contractInstance) {
                console.log('contractInstance.options: ', contractInstance.options);
                console.log('contractInstance.options.address: ', contractInstance.options.address); // instance with the new contract address

                enderecoContrato = contractInstance.options.address;

                response.json({
                    status: 'sucesso',
                    data: {
                        abi: abiDefinition,
                        contractData: contractInstance.options.data,
                        transactionHashContrato: transactionHashContrato,
                        enderecoContrato: contractInstance.options.address
                    }
                });

            });

        // Gas estimation
        // .estimateGas(function (err, gas) {
        //     console.log('estimateGas: ', gas); - 338688
        // })
        // logger.info('deployedContract: ', deployedContract);
        // logger.info('deployedContract.address: ', deployedContract.address);
        // let contractInstance = VotacaoContract.at(deployedContract.address)
        // logger.info('contractInstance: ', contractInstance);
    } catch (err) {
        throw err;
    }
});

votacaoRouter.get('/votosTotais', function (request: Request, response: Response, next: NextFunction) {

    try {
        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.totalVotes().call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
            .then(function (qtdVotos) {
                console.log('qtdVotos: ', qtdVotos);

                response.json({
                    status: 'sucesso',
                    data: {
                        votos: qtdVotos
                    }
                });
            });
    } catch (err) {
        throw err;
    }
});


votacaoRouter.get('/votosCandidato/:numeroCandidato', function (request: Request, response: Response, next: NextFunction) {

    try {

        let numeroCandidato = request.params.numeroCandidato;
        console.log('numeroCandidato: ', numeroCandidato);

        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.totalVotesFor(numeroCandidato).call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
            .then(function (qtdVotosCandidato) {
                console.log('qtdVotosCandidato: ', qtdVotosCandidato);
                response.json({
                    status: 'sucesso',
                    data: {
                        votosCandidato: qtdVotosCandidato
                    }
                });
            });
    } catch (err) {
        throw err;
    }
});

votacaoRouter.get('/votar/:numeroCandidato', function (request: Request, response: Response, next: NextFunction) {

    try {
        let numeroCandidato = request.params.numeroCandidato;
        console.log('numeroCandidato: ', numeroCandidato);
        // using the promise
        // myContract.methods.myMethod(123).send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' })
        //     .then(function (receipt) {
        //         // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
        //     });

        // using the event emitter
        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.voteForCandidate(numeroCandidato).send({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash: ', hash);
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log('confirmation: ', confirmationNumber);
            })
            .on('receipt', function (receipt) {
                console.log(receipt);
                response.json({
                    status: 'sucesso',
                    data: {
                        receipt: receipt
                    }
                });
            })
            .on('error', console.error);
    } catch (err) {
        throw err;
    }
});

// 74162 gas usados, se precisar
votacaoRouter.get('/adicionarCandidato/:nomeCandidato/:numeroCandidato', function (request: Request, response: Response, next: NextFunction) {

    try {
        let nomeCandidato = request.params.nomeCandidato;
        console.log('nomeCandidato: ', nomeCandidato);
        let numeroCandidato = request.params.numeroCandidato;
        console.log('numeroCandidato: ', numeroCandidato);

        // using the event emitter
        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.addCandidato(nomeCandidato, numeroCandidato)
            // .estimateGas({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' }, function (error, gasAmount) {
            //     console.log('error', error);
            //     console.log('gasAmount', gasAmount);
            // });
            .send({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash: ', hash);
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log('confirmation: ', confirmationNumber);
            })
            .on('receipt', function (receipt) {
                console.log(receipt);
                response.json({
                    status: 'sucesso',
                    data: {
                        receipt: receipt
                    }
                });
            })
            .on('error', console.error);
    } catch (err) {
        throw err;
    }
});

