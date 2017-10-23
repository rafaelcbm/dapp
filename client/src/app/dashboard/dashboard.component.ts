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

    constructor(private http: HttpClient, private ref: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.windowRef = window;

        if (typeof this.windowRef.web3 !== 'undefined') {
            console.warn("Using web3 detected from external source like Metamask or MIST Browser")
            // Use Mist/MetaMask's provider
            this.web3 = new Web3(this.windowRef.web3.currentProvider);
        } else {
            console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        this.mostrarContas();
    }

    chamarContrato() {

        this.http.get('/api/votacao/deploy').subscribe(
            (resposta: any) => {
                console.log(resposta);

                console.log(resposta.data.abi);

                let VotacaoContract = new this.web3.eth.Contract(resposta.data.abi, resposta.data.enderecoContrato);
                console.log('VotacaoContract: ', VotacaoContract);

                VotacaoContract.methods.totalVotesFor(this.web3.utils.asciiToHex('Rama')).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
                    .then(function (qtdVotos) {
                        console.log('qtdVotos: ', qtdVotos);
                    });
            }
        );
    }

    criarContrato() {
        this.http.get('/api/votacao/deploy').subscribe(
            (resposta: any) => {
                console.log('resposta deploy: ', resposta);

                this.contractAbi = resposta.data.abi;
                this.contractAddress = resposta.data.enderecoContrato;

                this.contratoRegistrado = true;
                this.linkContrato = `https://kovan.etherscan.io/address/${this.contractAddress}`;
                this.registroContrato = `https://kovan.etherscan.io/tx/${resposta.data.transactionHashContrato}`;
                this.showBtnDeployContrato = false;
            }
        );
    }

    criarContratoLocal() {


        let self = this;
        let transactionHashContrato: any;
        let defaultAccount: any;

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
                        // .estimateGas(function (err, gas) {
                        //         console.log('estimateGas: ', gas);//  338688
                        //     });
                        .send({
                            //from: '0x00d091E3b56518e1d34f218239da72907EB74f43',
                            from: defaultAccount,
                            //gas: 323481
                            //gasPrice: '1000000',
                        })
                        // .on('error', function (error) {
                        //     console.log('Erro ao fazer o deploy do contrato.')
                        //     throw error;
                        // })
                        .on('transactionHash', function (transactionHash) {
                            console.log('Contrato Criado - transactionHash: ', transactionHash);
                            transactionHashContrato = transactionHash;
                        })
                        .then(contractInstance => {
                            console.log('contractInstance.options.address: ', contractInstance.options.address); // instance with the new contract address
                            this.contractAddress = contractInstance.options.address;

                            this.contratoRegistrado = true;
                            this.linkContrato = `https://kovan.etherscan.io/address/${this.contractAddress}`;
                            this.registroContrato = `https://kovan.etherscan.io/tx/${transactionHashContrato}`;
                            this.showBtnDeployContrato = false;

                            this.ref.detectChanges();
                        });
                }
            );
        });
    }

    obterQtdVotosTotais() {

        // let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
        // console.log('VotacaoContract: ', VotacaoContract);

        // VotacaoContract.methods.totalVotes().call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
        //     .then(function (qtdVotos) {
        //         console.log('qtdVotos: ', qtdVotos);
        //     });


        // this.http.get('/api/votacao/votosTotais').subscribe(
        //     (resposta: any) => {
        //         console.log('resposta qtdVotos Totais: ', resposta);
        //     }
        // );
    }


    obterQtdVotosCandidato(numeroCandidato) {
        console.log('numeroCandidato: ', numeroCandidato);

        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
        console.log('VotacaoContract: ', VotacaoContract);

        VotacaoContract.methods.totalVotesFor(numeroCandidato).call({ from: '0x00d091E3b56518e1d34f218239da72907EB74f43' })
            .then(function (qtdVotosCandidato) {
                console.log('qtdVotosCandidato: ', qtdVotosCandidato);
            });

        // this.http.get(`/api/votacao/votosCandidato/${numeroCandidato}`).subscribe(
        //     (resposta: any) => {
        //         console.log(`resposta qtdVotos Candidato : ${numeroCandidato}` , resposta);
        //     }
        // );
    }


    votarCandidato(candidato) {
        // this.http.get(`/api/votacao/votar/${numeroCandidato}`).subscribe(
        //     (resposta: any) => {
        //         console.log(`resposta Votar Candidato : ${numeroCandidato}` , resposta);
        //     }
        // );

        try {
            console.log('voto no candidato: ', candidato);

            let defaultAccount: any;

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
                VotacaoContract.methods.voteForCandidate(candidato.numero).send(
                    { from: defaultAccount })
                    .on('transactionHash', function (hash) {
                        console.log('transactionHash: ', hash);
                    })
                    // .on('confirmation', function (confirmationNumber, receipt) {
                    //     console.log('confirmation: ', confirmationNumber);
                    // })
                    .on('receipt', receipt => {
                        console.log('receipt: ', receipt);
                        candidato.votacaoHash = receipt.transactionHash;
                    })
                    .on('error', console.error);
            });
        } catch (err) {
            throw err;
        }
    }

    addCandidato() {
        const candidato = { nome: this.nomeCandidato, numero: this.numeroCandidato };
        this.adicionarCandidato(candidato);
    }

    adicionarCandidato(candidato) {
        try {
            //let self = this;
            let defaultAccount: any;

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
                VotacaoContract.methods.addCandidato(candidato.nome, candidato.numero)
                    .send({ from: defaultAccount })
                    .on('transactionHash', function (hash) {
                        console.log('transactionHash: ', hash);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        //console.log('confirmation: ', confirmationNumber);
                    })
                    .on('receipt', receipt => {
                        console.log('receipt: ', receipt);
                        candidato.transactionHash = receipt.transactionHash;
                        this.candidatos.push(candidato);
                        console.log('this.candidatos - ', this.candidatos);
                    })
                    .on('error', console.error);
            });
        } catch (err) {
            throw err;
        }
    }

    deleteCandidato(candidato) {

        this.candidatos.splice(this.candidatos.findIndex((element, index, array) => element.nome === candidato.nome), 1);
    }

    concluirCadastroVotacao() {
        console.log('* concluirCadastroVotacao ');
        this.cadastroVotacaoConcluida = true;
        this.ref.detectChanges();
    }

    concluirVotacao() {

        this.cadastroVotacaoConcluida = false;
        this.votacaoConcluida = true;

        //let self = this;

        let defaultAccount: any;
        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);

        this.candidatos.forEach(candidato => {

            this.web3.eth.getAccounts((err, accs) => {
                defaultAccount = accs[0];

                VotacaoContract.methods.totalVotesFor(candidato.numero).call({ from: defaultAccount })
                    .then(qtdVotosCandidato => {
                        candidato.qtdVotosCandidato = qtdVotosCandidato;
                        console.log(`Candidato: ${candidato.nome}, Votos: ${candidato.qtdVotosCandidato}`);
                        this.ref.detectChanges();
                    });
            });
        });

        this.web3.eth.getAccounts((err, accs) => {
            defaultAccount = accs[0];

            VotacaoContract.methods.totalVotes().call({ from: defaultAccount })
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
                console.log("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
        });
    }
}
