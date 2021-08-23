const DevToken = artifacts.require("DevToken");
const EthSwap = artifacts.require("EthSwap");

require('chai')
	.use(require('chai-as-promised'))
	.should();

function tokens(n) {
	return web3.utils.toWei(n, 'ether');
}	

contract('EthSwap', ([deployer, investor]) => {

	let token, ethSwap;

	before(async () => {
		token = await DevToken.new();
		ethSwap = await EthSwap.new(token.address);
		await token.transfer(ethSwap.address, tokens('1000000'));
	});
	
	describe('Token deployment', async () => {
		it('contract has a name', async () => {
			const name = await token.name();
			assert.equal(name, 'Dev Token')
		});
	});

	describe('EthSwap deployment', async () => {
		it('contract has a name', async () => {
			const name = await ethSwap.name();
			assert.equal(name, 'EthSwap Instant Exchange')
		});

		it('contract has tokens', async () => {
			let balance = await token.balanceOf(ethSwap.address);
			assert.equal(balance.toString(), tokens('1000000'));
		});
	});

	describe('buyTokens', async () => {
		let result;

		before(async () => {
			result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')});
		});

		it('Allows user to purchase tokens', async () => {
			let investorBalance = await token.balanceOf(investor);
			assert.equal(investorBalance.toString(), tokens('200'));

			let ethSwapBalance = await token.balanceOf(ethSwap.address);
			assert.equal(ethSwapBalance.toString(), tokens('999800'));
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'));

			const event = result.logs[0].args;
			assert.equal(event.account, investor);
			assert.equal(event.token, token.address);
			assert.equal(event.amount.toString(), tokens('200'));
			assert.equal(event.rate.toString(), '200');
		});
	});

	describe('sellTokens', async () => {
		let result;

		before(async () => {
			await token.approve(ethSwap.address, tokens('200'), {from: investor});
			result = await ethSwap.sellTokens(tokens('200'), { from: investor });
		});

		it('Allows user to sell tokens', async () => {
			let investorBalance = await token.balanceOf(investor);
			assert.equal(investorBalance.toString(), '0');

			let ethSwapBalance = await token.balanceOf(ethSwap.address);
			assert.equal(ethSwapBalance.toString(), tokens('1000000'));
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address);
			assert.equal(ethSwapBalance.toString(), '0');

			const event = result.logs[0].args;
			assert.equal(event.account, investor);
			assert.equal(event.token, token.address);
			assert.equal(event.amount.toString(), tokens('200'));
			assert.equal(event.rate.toString(), '200');

			//FAILURE : investor can’t sell more tokens than they have
			await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
		});
	});

})