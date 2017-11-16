import { EventsService } from './eventsService.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { default as Web3 } from 'web3';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']

})
export class DashboardComponent implements OnInit {

    contractAddress: any;
    contractAbi: any;
    contractData: any;

    windowRef: any;
    web3: Web3;

    cadastroVotacaoConcluida = false;
    votacaoConcluida = false;
    contratoRegistrado = false;
    linkContrato = '';
    registroContrato = '';
    showBtnDeployContrato = true;

    users: any[];

    candidatos: any[] = [];
    numeroCandidato = '';
    nomeCandidato = '';

    qtdVotosTotais = 0;

    constructor(private http: HttpClient, private ref: ChangeDetectorRef, private eventsService: EventsService) { }

    ngOnInit(): void {
        this.windowRef = window;

        if (typeof this.windowRef.web3 !== 'undefined') {
            console.warn("Using web3 detected from external source like Metamask or MIST Browser")
            // Usa Mist/MetaMask provider
            this.web3 = new Web3(this.windowRef.web3.currentProvider);
        } else {
            console.warn("web3 não encontrado. Buscando nó em: http://localhost:8545");
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        this.mostrarContas();
    }

    showProgressBar() {
        this.eventsService.showProgressBar();
    }

    hideProgressBar() {
        this.eventsService.hideProgressBar();
    }

    criarContrato() {

        try {
            this.showProgressBar();

            this.http.get('/api/votacao/deploy').subscribe(
                (resposta: any) => {
                    console.log('resposta deploy: ', resposta);

                    this.contractAbi = resposta.data.abi;
                    this.contractAddress = resposta.data.enderecoContrato;

                    this.contratoRegistrado = true;
                    this.linkContrato = `https://kovan.etherscan.io/address/${this.contractAddress}`;
                    this.registroContrato = `https://kovan.etherscan.io/tx/${resposta.data.transactionHashContrato}`;
                    this.showBtnDeployContrato = false;
                    this.hideProgressBar();
                }
            );
        } catch (e) {
            this.hideProgressBar();
        }
    }

    criarContratoLocal() {

        try {

            let self = this;
            let transactionHashContrato: any;
            let defaultAccount: any;

            this.showProgressBar();

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                this.http.get('/api/votacao/contractData').subscribe(
                    (resposta: any) => {
                        console.log('resposta contractData: ', resposta);

                        this.contractAbi = resposta.data.abi;
                        this.contractData = resposta.data.contractData;

                        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi);
                        VotacaoContract.options.data = this.contractData;

                        VotacaoContract.deploy()
                            .send({
                                //from: '0x00d091E3b56518e1d34f218239da72907EB74f43',
                                from: defaultAccount,
                                //gas: 323481
                                //gasPrice: '1000000',
                            })

                            .on('transactionHash', function (transactionHash) {
                                console.log('Contrato Criado - transactionHash: ', transactionHash);
                                transactionHashContrato = transactionHash;
                            })
                            .then(contractInstance => {
                                console.log('contractInstance.options.address: ', contractInstance.options.address);
                                this.contractAddress = contractInstance.options.address;

                                this.contratoRegistrado = true;
                                this.linkContrato = `https://kovan.etherscan.io/address/${this.contractAddress}`;
                                this.registroContrato = `https://kovan.etherscan.io/tx/${transactionHashContrato}`;
                                this.showBtnDeployContrato = false;

                                this.hideProgressBar();

                                this.ref.detectChanges();
                            });
                    }
                );
            });
        } catch (e) {
            this.hideProgressBar();
        }
    }


    obterQtdVotosCandidato(numeroCandidato) {
        console.log('numeroCandidato: ', numeroCandidato);

        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
        console.log('VotacaoContract: ', VotacaoContract);

        VotacaoContract.methods.totalVotosCandidato(numeroCandidato).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
            .then(function (qtdVotosCandidato) {
                console.log('qtdVotosCandidato: ', qtdVotosCandidato);
            });
    }


    votarCandidato(candidato) {

        try {
            console.log('voto no candidato: ', candidato);

            this.showProgressBar();

            let defaultAccount: any;

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
                VotacaoContract.methods.votarParaCandidato(candidato.numero).send(
                    { from: defaultAccount })
                    .on('transactionHash', function (hash) {
                        console.log('transactionHash: ', hash);
                    })
                    .on('receipt', receipt => {
                        console.log('receipt: ', receipt);
                        candidato.votacaoHash = receipt.transactionHash;

                        this.hideProgressBar();
                    })
                    .on('error', console.error);
            });
        } catch (err) {
            this.hideProgressBar();
            throw err;
        }
    }

    addCandidato() {
        const candidato = { nome: this.nomeCandidato, numero: this.numeroCandidato };
        this.adicionarCandidato(candidato);
    }

    adicionarCandidato(candidato) {
        try {

            this.showProgressBar();

            let defaultAccount: any;

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
                VotacaoContract.methods.adicionarCandidato(candidato.nome, candidato.numero)
                    .send({ from: defaultAccount })
                    .on('transactionHash', function (hash) {
                        console.log('transactionHash: ', hash);
                    })
                    .on('receipt', receipt => {
                        console.log('receipt: ', receipt);
                        candidato.transactionHash = receipt.transactionHash;
                        this.candidatos.push(candidato);
                        console.log('this.candidatos - ', this.candidatos);

                        this.hideProgressBar();
                    })
                    .on('error', console.error);
            });
        } catch (err) {
            this.hideProgressBar();
            throw err;
        }
    }

    concluirCadastroVotacao() {
        console.log('* concluirCadastroVotacao ');
        this.cadastroVotacaoConcluida = true;
        this.ref.detectChanges();
    }

    concluirVotacao() {

        this.cadastroVotacaoConcluida = false;
        this.votacaoConcluida = true;

        let defaultAccount: any;
        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);

        this.candidatos.forEach(candidato => {

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                VotacaoContract.methods.totalVotosCandidato(candidato.numero).call({ from: defaultAccount })
                    .then(qtdVotosCandidato => {
                        candidato.qtdVotosCandidato = qtdVotosCandidato;
                        console.log(`Candidato: ${candidato.nome}, Votos: ${candidato.qtdVotosCandidato}`);
                        this.ref.detectChanges();
                    });
            });
        });

        this.web3.eth.getAccounts((err, accs) => {
            defaultAccount = accs[0];

            VotacaoContract.methods.totalVotos().call({ from: defaultAccount })
                .then(qtdVotosTotais => {
                    console.log('qtdVotosTotais:', qtdVotosTotais);
                    this.qtdVotosTotais = qtdVotosTotais;
                    this.ref.detectChanges();
                });
        });
    }

    mostrarContas() {
        this.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                console.log("Erro ao buscar contas.");
                return;
            }

            console.log("*** accs: ", accs);

            if (accs.length == 0) {
                console.log("Não foi possível obter as contas!.");
                return;
            }
        });
    }
}
