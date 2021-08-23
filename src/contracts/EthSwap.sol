pragma solidity ^0.5.0;

import "./DevToken.sol";

contract EthSwap {
	string public name = "EthSwap Instant Exchange";
	DevToken public token;
	uint public rate = 200;

	event TokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	event TokensSold(
		address account,
		address token,
		uint amount,
		uint rate
	);

	constructor(DevToken _token) public {
		token = _token;
	}

	function multiply(uint x, uint y) internal pure returns (uint z) {
		require(y == 0 || (z = x * y) / y == x);
	}

	function buyTokens () public payable {
		uint tokenAmount = multiply(msg.value, rate);

		require(token.balanceOf(address(this)) >= tokenAmount);

		token.transfer(msg.sender, tokenAmount);
		
		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}
	
	function sellTokens (uint _amount) public {
		uint etherAmount = _amount / rate;

		require(token.balanceOf(msg.sender) >= _amount);
		require(address(this).balance >= etherAmount);

		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(etherAmount);

		emit TokensSold(msg.sender, address(token), _amount, rate);
	}
}