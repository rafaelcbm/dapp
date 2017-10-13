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

export const userRouter: Router = Router();

//let provider = new Web3.providers.HttpProvider("http://localhost:8545");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// logger.info('provider: ', provider);
// let web3 = new Web3(provider);
logger.info('web3: ', web3);

//let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

logger.info('accounts: ');
web3.eth.getAccounts().then(console.log);

let contractFile = join(__dirname, '../../../contracts/Voting.sol');
logger.info('contractFile: ', contractFile);

//let code = fs.readFileSync('Voting.sol').toString();
let code = fs.readFileSync(contractFile).toString();
logger.info('code: ', code);
let compiledCode = solc.compile(code);
logger.info('compiledCode: ', compiledCode);

let abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
logger.info('abiDefinition: ', abiDefinition);
let VotingContract = new web3.eth.Contract(abiDefinition);
logger.info('VotingContract: ', VotingContract);
let byteCode = compiledCode.contracts[':Voting'].bytecode;
logger.info('byteCode: ', byteCode);
//Correção de bug da ferramenta
byteCode = '0x' + byteCode;
logger.info('compiledCode com prefixo: ', byteCode);


// logger.info('tx.gasprice: ', tx.gasprice);
// logger.info('msg.gas: ', msg.gas);

//TODO:Substituir
//let deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
//TODO: POR esse expmlo de https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy

let transactionHashContrato;

VotingContract.options.data = byteCode;


userRouter.post("/deploy", function (request: Request, response: Response, next: NextFunction) {

    let candidatos = request.body.candidatos;

    try {
        logger.info('candidatos: ', candidatos);

        let candidatosToHex = candidatos.map(candidato => web3.utils.asciiToHex(candidato.nome));
        logger.info('CandidatosToHex:', candidatosToHex);

        VotingContract.deploy({
            //data: byteCode
            // arguments: [[web3.utils.asciiToHex('Rama'), web3.utils.asciiToHex('Nick'), web3.utils.asciiToHex('Jose')]]
            arguments: [candidatosToHex]
        })
            // .estimateGas(function (err, gas) {
            //         console.log('estimateGas: ', gas);//  338688
            //     })
            .send({
                from: '0x00d091E3b56518e1d34f218239da72907EB74f43',
                //gasPrice: '1000000',
                gas: 338688//318984 // 338688 pro exemplo Nick, Rama, Jose - Mudar, tirando do construtor
            })
            .on('error', function (error) {
                console.log('Erro ao fazer o deploy do contrato.')
                throw error;
            })
            .on('transactionHash', function (transactionHash) {
                console.log('Contrato Criado - transactionHash: ', transactionHash);
                transactionHashContrato;
            })
            .then(function (newContractInstance) {
                console.log('newContractInstance.options: ', newContractInstance.options);
                console.log('newContractInstance.options.address: ', newContractInstance.options.address); // instance with the new contract address

                response.json({
                    status: 'sucesso',
                    data: {
                        abi: abiDefinition,
                        contractData: newContractInstance.options.data,
                        transactionHashContrato: transactionHashContrato,
                        enderecoContrato: newContractInstance.options.address
                    }
                });

            });

        // Gas estimation
        // .estimateGas(function (err, gas) {
        //     console.log('estimateGas: ', gas); - 338688
        // })
        // logger.info('deployedContract: ', deployedContract);
        // logger.info('deployedContract.address: ', deployedContract.address);
        // let contractInstance = VotingContract.at(deployedContract.address)
        // logger.info('contractInstance: ', contractInstance);
    } catch (err) {
        throw err;
    }
});


userRouter.get('/deploy', function (request: Request, response: Response, next: NextFunction) {

    try {

        let VotingContract = new web3.eth.Contract(abiDefinition, '0xf0ab11C74A75bA22Bbc4Be254bCE28A1d4A24D1b');
        VotingContract.methods.totalVotesFor(web3.utils.asciiToHex('Rama')).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
            .then(function (qtdVotos) {
                console.log('qtdVotos: ', qtdVotos);

                response.json({
                    status: 'sucesso',
                    data: {
                        votos: qtdVotos
                    }
                });
            });


        // VotingContract.options.data = byteCode;
        // VotingContract.deploy({
        //     arguments: [[web3.utils.asciiToHex('Rama'), web3.utils.asciiToHex('Nick'), web3.utils.asciiToHex('Jose')]]
        // })
        //     .send({
        //         from: '0x00d091E3b56518e1d34f218239da72907EB74f43',
        //         //gasPrice: '1000000',
        //         gas: 338688
        //     })
        //     .on('error', function (error) {
        //         console.log('Erro ao fazer o deploy do contrato.')
        //         throw error;
        //     })
        //     .on('transactionHash', function (transactionHash) {
        //         console.log('Contrato Criado - transactionHash: ', transactionHash);
        //         transactionHashContrato;
        //     })
        //     .then(function (newContractInstance) {
        //         console.log('newContractInstance.options: ', newContractInstance.options);
        //         console.log('newContractInstance.options.address: ', newContractInstance.options.address); // instance with the new contract address

        //         // Votando
        //         newContractInstance.methods.voteForCandidate(web3.utils.asciiToHex('Rama')).send({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
        //             .then(function (receipt) {
        //                 console.log('receipt: ', receipt);
        //                 console.log('receipt.transactionHash: ', receipt.transactionHash);

        //                 newContractInstance.methods.voteForCandidate(web3.utils.asciiToHex('Rama')).send({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
        //                     .then(function (receipt2) {
        //                         console.log('receipt2: ', receipt2);

        //                         newContractInstance.methods.totalVotesFor(web3.utils.asciiToHex('Rama')).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
        //                             .then(function (qtdVotos) {
        //                                 console.log('qtdVotos: ', qtdVotos);

        //                                 // let methodABI = newContractInstance.methods.totalVotesFor(123).encodeABI();
        //                                 // console.log('methodABI: ', methodABI);

        //                                 response.json({
        //                                     status: 'sucesso',
        //                                     data: {
        //                                         abi: abiDefinition,
        //                                         contractData: newContractInstance.options.data,
        //                                         hashContrato: transactionHashContrato,
        //                                         enderecoContrato: newContractInstance.options.address,
        //                                         recibo: receipt,
        //                                         recibo2: receipt2,
        //                                         votos: qtdVotos
        //                                         //methodABI:methodABI
        //                                     }
        //                                 })
        //                             });
        //                     });

        //             });


        //     });
    } catch (err) {
        throw err;
    }
});


