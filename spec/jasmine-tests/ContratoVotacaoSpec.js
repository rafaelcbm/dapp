describe("Contrato", function () {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    const fs = require("fs");
    const path_1 = require("path");
    const express_1 = require("express");
    const logger = require("logops");
    var Web3 = require('web3');
    var solc = require('solc');
    var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    let contractFile = path_1.join(__dirname, '../../contracts/Votacao.sol');
    let code = fs.readFileSync(contractFile).toString();
    let compiledCode = solc.compile(code);
    let abiDefinition = JSON.parse(compiledCode.contracts[':Votacao'].interface);
    let VotacaoContract = new web3.eth.Contract(abiDefinition);
    let byteCode = compiledCode.contracts[':Votacao'].bytecode;
    byteCode = '0x' + byteCode;

    let transactionHashContrato;
    let enderecoContrato;
    VotacaoContract.options.data = byteCode;

    it("deve ser capaz de ser criado", function (done) {

        console.log('*** Aguardando deploy do contrato... ');

        VotacaoContract.deploy()
            .send({
                from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b',
                gas: 323481
            })
            .on('error', function (error) {
                console.log('Erro ao fazer o deploy do contrato.')
                throw error;
            })
            .on('transactionHash', function (transactionHash) {
                console.log('Criação Contrato - transactionHash: ', transactionHash);
                transactionHashContrato = transactionHash;
            })
            .then(function (contractInstance) {
                //console.log('contractInstance.options: ', contractInstance.options);
                //console.log('contractInstance.options.address: ', contractInstance.options.address);

                enderecoContrato = contractInstance.options.address;
                VotacaoContract = new web3.eth.Contract(abiDefinition, enderecoContrato);

                expect(contractInstance).toBeTruthy();
                expect(contractInstance.options.address).toBeTruthy();
                expect(VotacaoContract).toBeTruthy();
            });

        setTimeout(() => {
            console.log('*** Contrato Criado !');
            done();
        }, 5000);
    });

    it("deve ser capaz de adicionar candidatos", function (done) {

        VotacaoContract.methods.adicionarCandidato('Rafael', 12)
            .send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash adicionarCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        VotacaoContract.methods.adicionarCandidato('Samantha', 31)
            .send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash adicionarCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        setTimeout(() => {
            console.log('*** Candidatos Adicionados !');
            done();
        }, 5000);

    });

    it("deve ser capaz de votar em candidatos", function (done) {

        VotacaoContract.methods.votarParaCandidato(12).send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash votarParaCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        VotacaoContract.methods.votarParaCandidato(12).send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash votarParaCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        VotacaoContract.methods.votarParaCandidato(31).send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash votarParaCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        VotacaoContract.methods.votarParaCandidato(31).send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash votarParaCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        VotacaoContract.methods.votarParaCandidato(31).send({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .on('transactionHash', function (hash) {
                console.log('transactionHash votarParaCandidato: ', hash);
            })
            .on('receipt', function (receipt) {
                expect(receipt).toBeTruthy();
                expect(receipt.transactionHash).toBeTruthy();
            })
            .on('error', console.error);

        setTimeout(() => {
            console.log('*** Votos Realizados !');
            done();
        }, 5000);
    });

    it("deve ser capaz de contar os votos dos candidatos", function (done) {

        VotacaoContract.methods.totalVotosCandidato(12).call({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .then(function (qtdVotosCandidato) {
                console.log('qtdVotosCandidato: ', qtdVotosCandidato);
                expect(qtdVotosCandidato).toEqual('2');
            });

        VotacaoContract.methods.totalVotosCandidato(31).call({ from: '0x58CdCB447a03373D38d151F1c87EaD14594b662b' })
            .then(function (qtdVotosCandidato) {
                console.log('qtdVotosCandidato: ', qtdVotosCandidato);
                expect(qtdVotosCandidato).toEqual('3');
            });

        setTimeout(() => {
            console.log('*** Contagem de Votos Concluída !');
            done();
        }, 2000);
    });
});
