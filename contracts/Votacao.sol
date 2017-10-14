pragma solidity ^0.4.15;
// We have to specify what version of compiler this code will compile with

contract Votacao {

    struct  infoCandidato 
    {
      string inomeCandidato;
      uint16 inumeroCandidato;
      uint iqtdVotos;
    }
  
  mapping (uint16 => infoCandidato) votosRecebidos;
  uint qtdVotos;

  function Votacao() public {
    qtdVotos = 0;
  }

  function addCandidato(string nomeCandidato, uint16 numeroCandidato) public {
    //TODO: Fazer validacoes depois
    //if (validCandidate(candidate) == false)  returns (bool);

    var novoCandidato = infoCandidato(nomeCandidato, numeroCandidato, 0);
    votosRecebidos[numeroCandidato] = novoCandidato;
  }
  
  function totalVotesFor(uint16 numeroCandidato) public constant returns (uint) {      
    return votosRecebidos[numeroCandidato].iqtdVotos;
  }

   function totalVotes() public constant returns (uint) {    
    return qtdVotos;
  }

  function voteForCandidate(uint16 numeroCandidato) public {
    //if (validCandidate(candidate) == false) return false;
    votosRecebidos[numeroCandidato].iqtdVotos += 1;
    qtdVotos++;
  }
}
