import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
            console.warn("Using web3 detected from external source like Metamask")
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
            (resposta: any) => console.log(resposta)
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

            // if (!this.accounts || this.accounts.length != accs.length || this.accounts[0] != accs[0]) {
            //     console.log("Observed new accounts");
            //     this.accountsObservable.next(accs);
            //     this.accounts = accs;
            // }

            // this.ready = true;
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

        this.chamarContrato();

        if (!this.cadastroVotacaoConcluida) {

            this.http.get('/api/users/all').subscribe(
                (resposta: any) => {
                    console.log('Contrato recebido:', resposta.data)
                    console.log('Votação Criada');
                    this.cadastroVotacaoConcluida = true;
                }
            );
        }
    }
}
