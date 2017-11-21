import * as fs from 'fs';
import { join } from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import * as logger from 'logops';
var Web3 = require('web3');
var solc = require('solc');

export const votacaoRouter: Router = Router();

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

logger.info('web3: ', web3);
logger.info('accounts: ');
web3.eth.getAccounts().then(console.log);
let contractFile = join(__dirname, '../../../contracts/Votacao.sol');
logger.info('contractFile: ', contractFile);

let code = fs.readFileSync(contractFile).toString();
logger.info('code: ', code);
let compiledCode = solc.compile(code);
logger.info('compiledCode: ', compiledCode);
let abiDefinition = JSON.parse(compiledCode.contracts[':Votacao'].interface)
logger.info('abiDefinition: ', abiDefinition);
let VotacaoContract = new web3.eth.Contract(abiDefinition);
logger.info('VotacaoContract: ', VotacaoContract);
let byteCode = compiledCode.contracts[':Votacao'].bytecode;
byteCode = '0x' + byteCode;
logger.info('compiledCode com prefixo: ', byteCode);

let transactionHashContrato;
let enderecoContrato;

VotacaoContract.options.data = byteCode;

votacaoRouter.get("/contractData", function (request: Request, response: Response, next: NextFunction) {

    response.json({
        status: 'sucesso',
        data: {
            abi: abiDefinition,
            contractData: byteCode
        }
    });
});

votacaoRouter.get("/deploy", function (request: Request, response: Response, next: NextFunction) {

    try {

        VotacaoContract.deploy()
            .send({
                from: '0x00d091E3b56518e1d34f218239da72907EB74f43',
                gas: 323481
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
                console.log('contractInstance.options.address: ', contractInstance.options.address);

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
    } catch (err) {
        throw err;
    }
});

votacaoRouter.get('/votosTotais', function (request: Request, response: Response, next: NextFunction) {

    try {
        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.totalVotos().call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
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
        VotacaoContract.methods.totalVotosCandidato(numeroCandidato).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
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

        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.votarParaCandidato(numeroCandidato).send({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
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

votacaoRouter.get('/adicionarCandidato/:nomeCandidato/:numeroCandidato', function (request: Request, response: Response, next: NextFunction) {

    try {
        let nomeCandidato = request.params.nomeCandidato;
        console.log('nomeCandidato: ', nomeCandidato);
        let numeroCandidato = request.params.numeroCandidato;
        console.log('numeroCandidato: ', numeroCandidato);

        let VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);
        VotacaoContract.methods.adicionarCandidato(nomeCandidato, numeroCandidato).send({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
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

