pragma solidity ^0.5.0; 

contract PickBook{
 
    address[10] public pickers;

    function pick(uint bookId) public returns (uint) {
        require(bookId >= 0 && bookId <= 9);    //Check that the bookId is in range.
        
        pickers[bookId] = msg.sender;

        return bookId;  //return the bookId provided as a confirmation.
    }

    function k(uint bookId) public returns (uint) {
        require(bookId >= 0 && bookId <= 9);    //Check that the bookId is in range.

        require(pickers[bookId] == msg.sender);
        
        pickers[bookId] = 0x0000000000000000000000000000000000000000;

        return bookId;  //return the bookId provided as a confirmation.
    }

    //Retrieving the pickers.  //return the entire array
    function getPickers() public view returns (address[10] memory){
        return pickers;
    }



}