import * as fs from 'fs';
import { join } from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import * as logger from 'logops';
var Web3 = require('web3');
//import { default as Web3 } from 'web3';
//import { default as Web3 } from 'web3';
//import { default as solc } from 'solc';
var solc =require('solc');
//import { default as solc } from 'solc';


// import { default as Web3 } from 'web3';
// import { default as solc } from 'solc';

import { UserService } from '../services';

export const userRouter: Router = Router();

const userService = new UserService();

userRouter.get('/all', function (request: Request, response: Response, next: NextFunction) {

    try {
        const usersOnService = userService.getUsers().then(
            users => {
                setTimeout(() => {
                    logger.info('Esperando ............');
                    response.json({
                        status: 'sucesso',
                        data: users
                    })
                }, 2000);
            });
    } catch (err) {
        logger.error('## Erro ao obter conexão com MongoBD: %j', err);
        throw err;
    }
});

userRouter.post('/', function (request: Request & { userName: string }, response: Response, next: NextFunction) {

    const userName = request.body.userName;

    try {
        userService.insertUser(userName).then(
            data => response.status(201).json({
                status: 'sucesso'
            })
        );
    } catch (err) {
        logger.error(err);
        throw err;
    }
});


userRouter.get('/deploy', function (request: Request, response: Response, next: NextFunction) {

    try {

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

        //TODO:Substituir
        let deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
        //TODO: POR esse expmlo de https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#deploy
        myContract.options.data = '0x12345...';
        myContract.deploy({
            arguments: [123, 'My String']
        })
        .send({
            from: '0x1234567890123456789012345678901234567891',
            gas: 1500000,
            gasPrice: '30000000000000'
        })
        .then(function(newContractInstance){
            console.log(newContractInstance.options.address) // instance with the new contract address
        });


        logger.info('deployedContract: ', deployedContract);
        logger.info('deployedContract.address: ', deployedContract.address);
        let contractInstance = VotingContract.at(deployedContract.address)
        logger.info('contractInstance: ', contractInstance);

        response.json({
            status: 'sucesso',
            data: {}
        })

    } catch (err) {
        throw err;
    }
});


