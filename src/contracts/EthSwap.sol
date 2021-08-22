pragma solidity ^0.5.0;

import "./DevToken.sol";

contract EthSwap {
	string public name = "EthSwap Instant Exchange";
	DevToken public token;
	uint public rate = 200;

	event TokenPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	constructor(DevToken _token) public {
		token = _token;
	}

	function buyTokens () public payable {
		uint tokenAmount = msg.value * rate;

		require(token.balanceOf(address(this)) >= tokenAmount);

		token.transfer(msg.sender, tokenAmount);
		
		emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
	}
	
}