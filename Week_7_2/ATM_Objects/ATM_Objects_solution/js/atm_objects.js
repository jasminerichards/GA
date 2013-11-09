/*

The Bank of Programming needs you to create an account javascript object. It should have an owner, account number, balance, and date opened attributes. 
The Bank of Programming gives customers 100$ to start. 
Use a function to setup the account and ask the user to input the owner's name and account number. 


Show the account status by outputting the account information to the browser using console.log().

Bonus: 

Look up the Javascript new Date() class to assign the current date and time to the date opened attribute.

*/

function setupAccount(new_account){
	new_account.owner = prompt('What is the account owners name?');
	new_account.account_num = prompt('What is the account number');
	new_account.date_open = new Date().toString();
	return new_account;
}

	var account = {
			owner: ' ',
			account_num: '00000',
			balance: 100,
			date_open: ' '
	};
	account = setupAccount(account);
	console.log('Welcome to THE BANK OF PROGRAMMING');
	console.log('Account Number: ' + account.owner);
	console.log('Account Number: ' + account.account_num + ' Opened: ' + account.date_open);
	console.log('Your balance: ' + account.balance);



