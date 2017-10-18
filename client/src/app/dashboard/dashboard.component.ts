import { Component, OnInit } from '@angular/core';
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

    constructor(private http: HttpClient) { }

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

                VotacaoContract.methods.totalVotesFor(this.web3.utils.asciiToHex('Rama')).call({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
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

    obterQtdVotosTotais() {

        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
        console.log('VotacaoContract: ', VotacaoContract);

        VotacaoContract.methods.totalVotes().call({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
            .then(function (qtdVotos) {
                console.log('qtdVotos: ', qtdVotos);
            });


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

        VotacaoContract.methods.totalVotesFor(numeroCandidato).call({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
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

            let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
            VotacaoContract.methods.voteForCandidate(candidato.numero).send({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
                .on('transactionHash', function (hash) {
                    console.log('transactionHash: ', hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    console.log('confirmation: ', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log('receipt: ', receipt);
                    candidato.votacaoHash = receipt.transactionHash;
                })
                .on('error', console.error);
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

            console.log('candidato.nome: ', candidato.nome);
            console.log('candidato.numero: ', candidato.numero);
            let self = this;

            let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
            VotacaoContract.methods.addCandidato(candidato.nome, candidato.numero)
                .send({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
                .on('transactionHash', function (hash) {
                    console.log('transactionHash: ', hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    //console.log('confirmation: ', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log('receipt: ', receipt);
                    candidato.transactionHash = receipt.transactionHash;
                    self.candidatos.push(candidato);
                    console.log('this.candidatos - ', self.candidatos);
                })
                .on('error', console.error);

        } catch (err) {
            throw err;
        }
    }

    deleteCandidato(candidato) {

        this.candidatos.splice(this.candidatos.findIndex((element, index, array) => element.nome === candidato.nome), 1);
    }

    concluirCadastroVotacao() {
        this.cadastroVotacaoConcluida = true;
    }

    concluirVotacao() {

        this.cadastroVotacaoConcluida = false;
        this.votacaoConcluida = true;

        let self = this;

        this.candidatos.forEach(candidato => {

            let VotacaoContract = new self.web3.eth.Contract(this.contractAbi, this.contractAddress);

            VotacaoContract.methods.totalVotesFor(candidato.numero).call({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
                .then(function (qtdVotosCandidato) {
                    candidato.qtdVotosCandidato = qtdVotosCandidato;
                    console.log(`Candidato: ${candidato.nome}, Votos: ${candidato.qtdVotosCandidato}`);
                });

            VotacaoContract.methods.totalVotes().call({ from: '0x22ce1f2e818e0a089be39f8052b91d78d6c6c99b' })
                .then(function (qtdVotosTotais) {
                    console.log('qtdVotosTotais:', qtdVotosTotais);
                    self.qtdVotosTotais = qtdVotosTotais;
                });
        });
    }

    mostrarContas() {
        this.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            console.log("*** accs: ", accs);

            // Get the initial account balance so it can be displayed.
            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
        });
    }
}
