/*

ATM: Functions

We're going to make our ATM example application even more efficient.

There are two distinct things happening in this application. Users are either making a withdrawal, or a deposit. 
Lets break this logic into two functions. Only declare your balance, amount and response variables once.

*/

function deposit(b, a)
{
	b = b + a;
	return b;
}

function withdrawl(b, a)
{
	b = b - a;
	return b;
}

	var balance = 1000;
	var amount = 0;
	var response = prompt('(d)eposit or (w)ithdraw or (q)uit');

	while(response !== 'q'){
		amount = parseInt(prompt('How much?'),10);
		if(response === 'd')
		{
			balance = deposit(balance,amount);
			console.log('You just deposited $' + amount + '.00 and your balance is $' + balance + '.00');
		}
		else
		{
			balance = withdrawl(balance, amount);
			console.log('You just withdrew $' + amount + '.00 and your balance is $' + balance + '.00');
		}
			response = prompt('(d)eposit, (w)ithdraw, or (q)uit?');
	}
	console.log('Thank you for ATMing with us, your balance is : $' + balance + '.00');
