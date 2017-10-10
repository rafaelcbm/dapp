import { json } from 'body-parser';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { default as Web3 } from 'web3';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']

})
export class DashboardComponent implements OnInit {

    windowRef: any;
    web3: Web3;

    cadastroVotacaoConcluida = false;

    users: any[];

    candidatos: any[] = [];
    numeroCandidato = '';
    nomeCandidato = '';

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

        this.http.get('/api/users/deploy').subscribe(
            (resposta: any) => {
                console.log(resposta);

                console.log(resposta.data.abi);

                let VotingContract = new this.web3.eth.Contract(resposta.data.abi, resposta.data.enderecoContrato);
                console.log('VotingContract: ', VotingContract);

                VotingContract.methods.totalVotesFor(this.web3.utils.asciiToHex('Rama')).call({ from: '0x483bfa39124f77404faf37a209ca6ea2ce3cc1c2' })
                    .then(function (qtdVotos) {
                        console.log('qtdVotos: ', qtdVotos);
                    });
            }
        );
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
    }

    deleteCandidato(candidato) {

        this.candidatos.splice(this.candidatos.findIndex((element, index, array) => element.nome === candidato.nome), 1);
    }

    concluirVotacao() {

        if (!this.cadastroVotacaoConcluida) {

            let requestOptions:any = {
                headers: new HttpHeaders({ "Content-Type": "application/json"})
            }

            this.http.post('/api/users/deploy', JSON.stringify(this.candidatos), requestOptions)
                .subscribe((response: any) => console.log('Resposta:', response));

            //this.chamarContrato();
        }
    }
}
