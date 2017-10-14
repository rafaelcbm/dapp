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
            console.warn("No web3 detected. Falling back to http://localhost:8549. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8549"));
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

                VotacaoContract.methods.totalVotesFor(this.web3.utils.asciiToHex('Rama')).call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
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

                // let VotacaoContract = new this.web3.eth.Contract(resposta.data.abi, resposta.data.enderecoContrato);
                // console.log('VotacaoContract: ', VotacaoContract);

                // VotacaoContract.methods.totalVotesFor(this.web3.utils.asciiToHex('Rama')).call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
                //     .then(function (qtdVotos) {
                //         console.log('qtdVotos: ', qtdVotos);
                //     });
            }
        );
    }

    obterQtdVotosTotais() {

        let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
        console.log('VotacaoContract: ', VotacaoContract);

        VotacaoContract.methods.totalVotes().call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
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

        VotacaoContract.methods.totalVotesFor(numeroCandidato).call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
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
            VotacaoContract.methods.voteForCandidate(candidato.numero).send({ from: '0xc2364e0b0897dc3029103d8bef8b003a55ce7e34' })
                .on('transactionHash', function (hash) {
                    console.log('transactionHash: ', hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    console.log('confirmation: ', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log(receipt);
                })
                .on('error', console.error);
        } catch (err) {
            throw err;
        }
    }

    adicionarCandidato(nomeCandidato, numeroCandidato) {
        try {
            console.log('nomeCandidato: ', nomeCandidato);
            console.log('numeroCandidato: ', numeroCandidato);

            // using the event emitter            
            console.log('this.contractAbi: ', this.contractAbi);
            console.log('this.contractAddress: ', this.contractAddress);

            let VotacaoContract = new this.web3.eth.Contract(this.contractAbi, this.contractAddress);
            VotacaoContract.methods.addCandidato(nomeCandidato, numeroCandidato)
                .send({ from: '0xc2364e0b0897dc3029103d8bef8b003a55ce7e34' })
                .on('transactionHash', function (hash) {
                    console.log('transactionHash: ', hash);
                })
                .on('confirmation', function (confirmationNumber, receipt) {
                    console.log('confirmation: ', confirmationNumber);
                })
                .on('receipt', function (receipt) {
                    console.log(receipt);
                })
                .on('error', console.error);
        } catch (err) {
            throw err;
        }
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

    addCandidato() {
        const candidato = { nome: this.nomeCandidato, numero: this.numeroCandidato };
        console.log('cadidato - ', candidato)
        this.candidatos.push(candidato);
        console.log('this.candidatos - ', this.candidatos)

        this.adicionarCandidato(candidato.nome, candidato.numero);
    }

    deleteCandidato(candidato) {

        this.candidatos.splice(this.candidatos.findIndex((element, index, array) => element.nome === candidato.nome), 1);
    }

    concluirCadastroVotacao() {
        this.cadastroVotacaoConcluida = true;
    }

    concluirVotacao() {        

        this.votacaoConcluida = true;

        let self = this;

        this.candidatos.forEach(candidato => {

            let VotacaoContract = new self.web3.eth.Contract(this.contractAbi, this.contractAddress);

            VotacaoContract.methods.totalVotesFor(candidato.numero).call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
                .then(function (qtdVotosCandidato) {
                    candidato.qtdVotosCandidato = qtdVotosCandidato;
                    console.log(`Candidato: ${candidato.nome}, Votos: ${candidato.qtdVotosCandidato}`);
                });

            VotacaoContract.methods.totalVotes().call({ from: '0xC2364E0b0897dC3029103D8BeF8b003A55Ce7E34' })
                .then(function (qtdVotosTotais) {
                    console.log('qtdVotosTotais:', qtdVotosTotais);
                    self.qtdVotosTotais = qtdVotosTotais;
                });
        });
    }
}
